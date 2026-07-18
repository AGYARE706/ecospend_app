package com.ecospend.expense.services;

import com.anthropic.core.JsonValue;
import com.anthropic.models.messages.MessageParam;
import com.ecospend.expense.client.ClaudeClient;
import com.ecospend.expense.dto.AskCoachResponse;
import com.ecospend.expense.dto.CoachMessageView;
import com.ecospend.expense.dto.InsightOfTheDayResponse;
import com.ecospend.expense.exception.ResourceNotFoundException;
import com.ecospend.expense.models.CoachConversation;
import com.ecospend.expense.models.CoachDailyInsight;
import com.ecospend.expense.models.CoachMessage;
import com.ecospend.expense.repository.CoachConversationRepository;
import com.ecospend.expense.repository.CoachDailyInsightRepository;
import com.ecospend.expense.repository.CoachMessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class CoachService {

    private static final int HISTORY_LIMIT = 20;

    private static final String CHAT_SYSTEM_PROMPT = """
            You are "Ask EcoSpend", a friendly, concise financial coach inside the EcoSpend budgeting app.
            You have tools that read the user's real transactions, budgets, savings goals, income target and vaults.

            Rules:
            - Only state numbers that came from a tool result. Never estimate, guess, or round a figure the user
              could verify against their real data. If you haven't called a tool that would answer the question,
              call it before answering.
            - Call as many tools as you need, but do not call the same tool twice with the same arguments.
            - Currency is Ghanaian Cedis (GHS). Be warm but brief — 2-4 sentences unless the user asks for detail.
            - If a tool reports an error or unavailable data, say so plainly instead of making something up.
            """;

    private static final String INSIGHT_SYSTEM_PROMPT = """
            You write ONE short proactive insight for a budgeting app dashboard, using only the numbers given to
            you. Never invent a number. Respond in exactly this format and nothing else:
            HEADING: <max 5 words>
            MESSAGE: <one specific, encouraging-but-honest sentence, under 160 characters, mentioning a real figure>
            """;

    private final CoachConversationRepository conversationRepository;
    private final CoachMessageRepository messageRepository;
    private final CoachDailyInsightRepository dailyInsightRepository;
    private final ClaudeClient claudeClient;
    private final CoachToolService toolService;

    public CoachService(CoachConversationRepository conversationRepository,
            CoachMessageRepository messageRepository,
            CoachDailyInsightRepository dailyInsightRepository,
            ClaudeClient claudeClient,
            CoachToolService toolService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.dailyInsightRepository = dailyInsightRepository;
        this.claudeClient = claudeClient;
        this.toolService = toolService;
    }

    public boolean isConfigured() {
        return claudeClient.isConfigured();
    }

    @Transactional
    public AskCoachResponse chat(UUID userId, UUID conversationId, String message) {
        CoachConversation conversation = conversationId != null
                ? conversationRepository.findByIdAndUserId(conversationId, userId)
                        .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"))
                : createConversation(userId, message);

        List<CoachMessage> priorMessages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
        List<MessageParam> history = new ArrayList<>();
        int start = Math.max(0, priorMessages.size() - HISTORY_LIMIT);
        for (CoachMessage m : priorMessages.subList(start, priorMessages.size())) {
            history.add(toMessageParam(m));
        }
        history.add(MessageParam.builder().role(MessageParam.Role.USER).content(message).build());

        CoachMessage userMessage = new CoachMessage();
        userMessage.setConversationId(conversation.getId());
        userMessage.setRole(CoachMessage.ROLE_USER);
        userMessage.setContent(message);
        messageRepository.save(userMessage);

        String reply = claudeClient.runToolLoop(CHAT_SYSTEM_PROMPT, history, toolService.tools(),
                (toolName, input) -> toolService.execute(toolName, input, userId));

        CoachMessage assistantMessage = new CoachMessage();
        assistantMessage.setConversationId(conversation.getId());
        assistantMessage.setRole(CoachMessage.ROLE_ASSISTANT);
        assistantMessage.setContent(reply);
        messageRepository.save(assistantMessage);

        conversation.setUpdatedAt(OffsetDateTime.now());
        conversationRepository.save(conversation);

        return new AskCoachResponse(conversation.getId(), toView(assistantMessage));
    }

    public List<CoachConversation> listConversations(UUID userId) {
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    public List<CoachMessageView> getMessages(UUID userId, UUID conversationId) {
        conversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(this::toView)
                .toList();
    }

    /** Lazily generates and caches one insight per user per day. Empty when the coach isn't configured. */
    @Transactional
    public Optional<InsightOfTheDayResponse> insightOfTheDay(UUID userId) {
        if (!claudeClient.isConfigured()) {
            return Optional.empty();
        }

        LocalDate today = LocalDate.now();
        Optional<CoachDailyInsight> existing = dailyInsightRepository.findByUserIdAndInsightDate(userId, today);
        if (existing.isPresent()) {
            CoachDailyInsight insight = existing.get();
            return Optional.of(new InsightOfTheDayResponse(insight.getHeading(), insight.getMessage(), insight.getGeneratedAt()));
        }

        String spendingJson = toolService.execute(CoachToolService.GET_SPENDING_SUMMARY, JsonValue.from(Map.of()), userId);
        String budgetJson = toolService.execute(CoachToolService.GET_BUDGET_STATUS, JsonValue.from(Map.of()), userId);

        String prompt = "Spending summary JSON: " + spendingJson
                + "\nBudget status JSON: " + budgetJson;
        String narrated = claudeClient.narrate(INSIGHT_SYSTEM_PROMPT, prompt);
        String[] parsed = parseHeadingAndMessage(narrated);

        CoachDailyInsight insight = new CoachDailyInsight();
        insight.setUserId(userId);
        insight.setInsightDate(today);
        insight.setHeading(parsed[0]);
        insight.setMessage(parsed[1]);
        dailyInsightRepository.save(insight);

        return Optional.of(new InsightOfTheDayResponse(parsed[0], parsed[1], insight.getGeneratedAt()));
    }

    private static String[] parseHeadingAndMessage(String narrated) {
        String heading = "Today's insight";
        String message = narrated == null ? "" : narrated.trim();

        if (narrated != null) {
            for (String line : narrated.split("\\R")) {
                String trimmed = line.trim();
                if (trimmed.regionMatches(true, 0, "HEADING:", 0, 8)) {
                    heading = trimmed.substring(8).trim();
                } else if (trimmed.regionMatches(true, 0, "MESSAGE:", 0, 8)) {
                    message = trimmed.substring(8).trim();
                }
            }
        }
        if (message.isBlank()) {
            message = "Ask EcoSpend for a breakdown of your spending this month.";
        }
        return new String[] { heading, message };
    }

    private CoachConversation createConversation(UUID userId, String firstMessage) {
        CoachConversation conversation = new CoachConversation();
        conversation.setUserId(userId);
        conversation.setTitle(firstMessage.length() > 60 ? firstMessage.substring(0, 60) + "…" : firstMessage);
        return conversationRepository.save(conversation);
    }

    private static MessageParam toMessageParam(CoachMessage message) {
        MessageParam.Role role = CoachMessage.ROLE_USER.equals(message.getRole())
                ? MessageParam.Role.USER
                : MessageParam.Role.ASSISTANT;
        return MessageParam.builder().role(role).content(message.getContent()).build();
    }

    private CoachMessageView toView(CoachMessage message) {
        return new CoachMessageView(message.getId(), message.getRole(), message.getContent(), message.getCreatedAt());
    }
}
