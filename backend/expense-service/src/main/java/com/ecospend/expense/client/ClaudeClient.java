package com.ecospend.expense.client;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.core.JsonValue;
import com.anthropic.models.messages.ContentBlock;
import com.anthropic.models.messages.ContentBlockParam;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.MessageParam;
import com.anthropic.models.messages.StopReason;
import com.anthropic.models.messages.TextBlockParam;
import com.anthropic.models.messages.Tool;
import com.anthropic.models.messages.ToolResultBlockParam;
import com.anthropic.models.messages.ToolUseBlockParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Thin wrapper around the Anthropic Java SDK for "Ask EcoSpend". Two
 * entry points: {@link #runToolLoop} drives the grounded chat/insight
 * tool-use loop (Opus), {@link #narrate} is a single plain call used for
 * cheap one-sentence narration (Haiku). Disabled entirely (see
 * {@link #isConfigured()}) when no API key is set — callers must check
 * this before calling either method, no simulated fallback is provided.
 */
@Component
public class ClaudeClient {

    private static final Logger log = LoggerFactory.getLogger(ClaudeClient.class);
    private static final int MAX_TOOL_ITERATIONS = 6;

    private final AnthropicClient client;
    private final boolean configured;
    private final String chatModel;
    private final String narrationModel;

    public ClaudeClient(
            @Value("${anthropic.api-key:}") String apiKey,
            @Value("${anthropic.chat-model}") String chatModel,
            @Value("${anthropic.narration-model}") String narrationModel) {
        this.configured = apiKey != null && !apiKey.isBlank();
        this.client = configured ? AnthropicOkHttpClient.builder().apiKey(apiKey).build() : null;
        this.chatModel = chatModel;
        this.narrationModel = narrationModel;
    }

    public boolean isConfigured() {
        return configured;
    }

    @FunctionalInterface
    public interface ToolExecutor {
        String execute(String toolName, JsonValue input);
    }

    /**
     * Runs the manual tool-use loop: call the model, execute any requested
     * tools against real data via {@code executor}, feed the results back,
     * repeat until Claude stops calling tools. Returns the concatenated
     * text of the final turn.
     */
    public String runToolLoop(String systemPrompt, List<MessageParam> history, List<Tool> tools, ToolExecutor executor) {
        List<MessageParam> messages = new ArrayList<>(history);

        for (int iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
            MessageCreateParams.Builder builder = MessageCreateParams.builder()
                    .model(chatModel)
                    .maxTokens(2048L)
                    .system(systemPrompt)
                    .messages(messages);
            for (Tool tool : tools) {
                builder.addTool(tool);
            }

            Message response = client.messages().create(builder.build());

            List<ContentBlockParam> assistantBlocks = new ArrayList<>();
            List<ContentBlockParam> toolResults = new ArrayList<>();
            StringBuilder textOut = new StringBuilder();

            for (ContentBlock block : response.content()) {
                block.text().ifPresent(t -> {
                    assistantBlocks.add(ContentBlockParam.ofText(
                            TextBlockParam.builder().text(t.text()).build()));
                    textOut.append(t.text());
                });
                block.toolUse().ifPresent(toolUse -> {
                    ToolUseBlockParam.Input inputParam = ToolUseBlockParam.Input.builder()
                            .additionalProperties(asObjectMap(toolUse._input()))
                            .build();
                    assistantBlocks.add(ContentBlockParam.ofToolUse(
                            ToolUseBlockParam.builder()
                                    .id(toolUse.id())
                                    .name(toolUse.name())
                                    .input(inputParam)
                                    .build()));
                    String result;
                    try {
                        result = executor.execute(toolUse.name(), toolUse._input());
                    } catch (Exception e) {
                        log.warn("Coach tool {} failed: {}", toolUse.name(), e.getMessage());
                        result = "This tool failed to run: " + e.getMessage();
                    }
                    toolResults.add(ContentBlockParam.ofToolResult(
                            ToolResultBlockParam.builder()
                                    .toolUseId(toolUse.id())
                                    .content(result)
                                    .build()));
                });
            }

            boolean requestedTool = response.stopReason()
                    .filter(reason -> reason == StopReason.TOOL_USE)
                    .isPresent();
            if (!requestedTool) {
                return textOut.toString();
            }

            messages.add(MessageParam.builder()
                    .role(MessageParam.Role.ASSISTANT)
                    .contentOfBlockParams(assistantBlocks)
                    .build());
            messages.add(MessageParam.builder()
                    .role(MessageParam.Role.USER)
                    .contentOfBlockParams(toolResults)
                    .build());
        }

        log.warn("Coach tool loop hit the {} iteration cap without finishing", MAX_TOOL_ITERATIONS);
        return "I wasn't able to finish looking that up — please try asking again.";
    }

    /** Single, non-tool call for cheap narration (e.g. anomaly alerts, daily insight). */
    public String narrate(String systemPrompt, String userPrompt) {
        MessageCreateParams params = MessageCreateParams.builder()
                .model(narrationModel)
                .maxTokens(300L)
                .system(systemPrompt)
                .addUserMessage(userPrompt)
                .build();

        Message response = client.messages().create(params);
        StringBuilder out = new StringBuilder();
        for (ContentBlock block : response.content()) {
            block.text().ifPresent(t -> out.append(t.text()));
        }
        return out.toString();
    }

    @SuppressWarnings("unchecked")
    private static Map<String, JsonValue> asObjectMap(JsonValue value) {
        Map<String, Object> raw = value.convert(Map.class);
        if (raw == null) {
            return Map.of();
        }
        Map<String, JsonValue> result = new java.util.LinkedHashMap<>();
        raw.forEach((k, v) -> result.put(k, JsonValue.from(v)));
        return result;
    }
}
