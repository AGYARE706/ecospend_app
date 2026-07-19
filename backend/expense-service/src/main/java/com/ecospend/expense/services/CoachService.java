package com.ecospend.expense.services;

import com.ecospend.expense.client.GeminiClient;
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
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.types.Content;
import com.google.genai.types.Part;
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
            You are "Abena", a friendly, concise financial coach inside the EcoSpend budgeting app.
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
    private final GeminiClient geminiClient;
    private final CoachToolService toolService;
    private final ObjectMapper objectMapper;

    public CoachService(CoachConversationRepository conversationRepository,
            CoachMessageRepository messageRepository,
            CoachDailyInsightRepository dailyInsightRepository,
            GeminiClient geminiClient,
            CoachToolService toolService,
            ObjectMapper objectMapper) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.dailyInsightRepository = dailyInsightRepository;
        this.geminiClient = geminiClient;
        this.toolService = toolService;
        this.objectMapper = objectMapper;
    }

    public boolean isConfigured() {
        return geminiClient.isConfigured();
    }

    @Transactional
    public AskCoachResponse chat(UUID userId, UUID conversationId, String message) {
        CoachConversation conversation = conversationId != null
                ? conversationRepository.findByIdAndUserId(conversationId, userId)
                        .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"))
                : createConversation(userId, message);

        List<CoachMessage> priorMessages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
        List<Content> history = new ArrayList<>();
        int start = Math.max(0, priorMessages.size() - HISTORY_LIMIT);
        for (CoachMessage m : priorMessages.subList(start, priorMessages.size())) {
            history.add(toContent(m));
        }
        history.add(Content.builder().role("user").parts(List.of(Part.fromText(message))).build());

        CoachMessage userMessage = new CoachMessage();
        userMessage.setConversationId(conversation.getId());
        userMessage.setRole(CoachMessage.ROLE_USER);
        userMessage.setContent(message);
        messageRepository.save(userMessage);

        String reply = geminiClient.runToolLoop(CHAT_SYSTEM_PROMPT, history, toolService.tools(),
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
        if (!geminiClient.isConfigured()) {
            return Optional.empty();
        }

        LocalDate today = LocalDate.now();
        Optional<CoachDailyInsight> existing = dailyInsightRepository.findByUserIdAndInsightDate(userId, today);
        if (existing.isPresent()) {
            CoachDailyInsight insight = existing.get();
            return Optional.of(new InsightOfTheDayResponse(insight.getHeading(), insight.getMessage(), insight.getGeneratedAt()));
        }

        Object spendingResult = toolService.execute(CoachToolService.GET_SPENDING_SUMMARY, Map.of(), userId);
        Object budgetResult = toolService.execute(CoachToolService.GET_BUDGET_STATUS, Map.of(), userId);

        String prompt = "Spending summary JSON: " + toJson(spendingResult)
                + "\nBudget status JSON: " + toJson(budgetResult);
        String narrated = geminiClient.narrate(INSIGHT_SYSTEM_PROMPT, prompt);
        String[] parsed = parseHeadingAndMessage(narrated);

        CoachDailyInsight insight = new CoachDailyInsight();
        insight.setUserId(userId);
        insight.setInsightDate(today);
        insight.setHeading(parsed[0]);
        insight.setMessage(parsed[1]);
        dailyInsightRepository.save(insight);

        return Optional.of(new InsightOfTheDayResponse(parsed[0], parsed[1], insight.getGeneratedAt()));
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return String.valueOf(value);
        }
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
            message = "Ask Abena for a breakdown of your spending this month.";
        }
        return new String[] { heading, message };
    }

    private CoachConversation createConversation(UUID userId, String firstMessage) {
        CoachConversation conversation = new CoachConversation();
        conversation.setUserId(userId);
        conversation.setTitle(firstMessage.length() > 60 ? firstMessage.substring(0, 60) + "…" : firstMessage);
        return conversationRepository.save(conversation);
    }

    private static Content toContent(CoachMessage message) {
        String role = CoachMessage.ROLE_USER.equals(message.getRole()) ? "user" : "model";
        return Content.builder().role(role).parts(List.of(Part.fromText(message.getContent()))).build();
    }

    private CoachMessageView toView(CoachMessage message) {
        return new CoachMessageView(message.getId(), message.getRole(), message.getContent(), message.getCreatedAt());
    }
}
