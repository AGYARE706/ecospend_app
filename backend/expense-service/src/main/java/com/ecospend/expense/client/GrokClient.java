package com.ecospend.expense.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

/**
 * The only class that talks to Grok (xAI) for "Abena". Uses xAI's
 * OpenAI-compatible chat-completions API. Two entry points:
 * {@link #runToolLoop} drives the grounded chat/insight tool-use loop and
 * {@link #narrate} is a single plain call for cheap one-sentence narration.
 * Disabled entirely (see {@link #isConfigured()}) when no API key is set —
 * callers must check this first; no simulated fallback is provided.
 */
@Component
public class GrokClient {

    private static final Logger log = LoggerFactory.getLogger(GrokClient.class);
    private static final int MAX_TOOL_ITERATIONS = 6;

    private final boolean configured;
    private final String chatModel;
    private final String narrationModel;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GrokClient(
            @Value("${grok.api-key:}") String apiKey,
            @Value("${grok.base-url:https://api.x.ai/v1}") String baseUrl,
            @Value("${grok.chat-model}") String chatModel,
            @Value("${grok.narration-model}") String narrationModel,
            ObjectMapper objectMapper) {
        this.configured = apiKey != null && !apiKey.isBlank();
        this.chatModel = chatModel;
        this.narrationModel = narrationModel;
        this.objectMapper = objectMapper;
        this.restClient = configured
                ? RestClient.builder()
                        .baseUrl(baseUrl)
                        .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey.trim())
                        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                        .build()
                : null;
    }

    public boolean isConfigured() {
        return configured;
    }

    /** One prior conversation turn. {@code role} is "user" or "assistant". */
    public record ChatTurn(String role, String content) {}

    /** A callable tool: {@code parameters} is a JSON-Schema object describing its arguments. */
    public record ToolSpec(String name, String description, Map<String, Object> parameters) {}

    @FunctionalInterface
    public interface ToolExecutor {
        /** Returns a Map/List/scalar — serialised to JSON and fed back to the model. */
        Object execute(String toolName, Map<String, Object> args);
    }

    /**
     * Runs the manual tool-use loop: call the model, execute any requested
     * tools against real data via {@code executor}, feed the results back,
     * repeat until Grok stops calling tools. Returns the final assistant text.
     */
    public String runToolLoop(
            String systemPrompt, List<ChatTurn> history, List<ToolSpec> tools, ToolExecutor executor) {
        ArrayNode messages = objectMapper.createArrayNode();
        messages.add(textMessage("system", systemPrompt));
        for (ChatTurn turn : history) {
            messages.add(textMessage(turn.role(), turn.content()));
        }
        ArrayNode toolsJson = toolsToJson(tools);

        for (int iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
            JsonNode message = callChat(chatModel, messages, toolsJson, 2048);
            JsonNode toolCalls = message.path("tool_calls");
            if (!toolCalls.isArray() || toolCalls.isEmpty()) {
                return message.path("content").asText("");
            }

            // Echo the assistant's tool-call turn, then answer each call.
            ObjectNode assistant = objectMapper.createObjectNode();
            assistant.put("role", "assistant");
            assistant.set("content", message.hasNonNull("content") ? message.get("content") : objectMapper.nullNode());
            assistant.set("tool_calls", toolCalls);
            messages.add(assistant);

            for (JsonNode call : toolCalls) {
                String id = call.path("id").asText("");
                JsonNode fn = call.path("function");
                String name = fn.path("name").asText("");
                Map<String, Object> args = parseArgs(fn.path("arguments").asText("{}"));

                Object result;
                try {
                    result = executor.execute(name, args);
                } catch (Exception e) {
                    log.warn("Coach tool {} failed: {}", name, e.getMessage());
                    result = Map.of("error", "This tool failed to run: " + e.getMessage());
                }
                messages.add(toolMessage(id, result));
            }
        }

        log.warn("Coach tool loop hit the {} iteration cap without finishing", MAX_TOOL_ITERATIONS);
        return "I wasn't able to finish looking that up — please try asking again.";
    }

    /** Single, non-tool call for cheap narration (e.g. anomaly alerts, daily insight). */
    public String narrate(String systemPrompt, String userPrompt) {
        ArrayNode messages = objectMapper.createArrayNode();
        messages.add(textMessage("system", systemPrompt));
        messages.add(textMessage("user", userPrompt));
        return callChat(narrationModel, messages, null, 300).path("content").asText("");
    }

    /** POSTs a chat-completions request and returns choices[0].message. */
    private JsonNode callChat(String model, ArrayNode messages, ArrayNode tools, int maxTokens) {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", model);
        body.set("messages", messages);
        body.put("max_tokens", maxTokens);
        if (tools != null && !tools.isEmpty()) {
            body.set("tools", tools);
        }

        try {
            JsonNode response = restClient.post()
                    .uri("/chat/completions")
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
            if (response == null) {
                throw new IllegalStateException("Empty response from Grok");
            }
            return response.path("choices").path(0).path("message");
        } catch (RestClientException e) {
            throw new IllegalStateException("Grok request failed: " + e.getMessage(), e);
        }
    }

    private ObjectNode textMessage(String role, String content) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("role", role);
        node.put("content", content == null ? "" : content);
        return node;
    }

    private ObjectNode toolMessage(String toolCallId, Object result) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("role", "tool");
        node.put("tool_call_id", toolCallId);
        node.put("content", toJson(result));
        return node;
    }

    private ArrayNode toolsToJson(List<ToolSpec> tools) {
        ArrayNode array = objectMapper.createArrayNode();
        for (ToolSpec tool : tools) {
            ObjectNode fn = objectMapper.createObjectNode();
            fn.put("name", tool.name());
            fn.put("description", tool.description());
            fn.set("parameters", objectMapper.valueToTree(tool.parameters()));

            ObjectNode wrapper = objectMapper.createObjectNode();
            wrapper.put("type", "function");
            wrapper.set("function", fn);
            array.add(wrapper);
        }
        return array;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseArgs(String arguments) {
        if (arguments == null || arguments.isBlank()) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(arguments, Map.class);
        } catch (Exception e) {
            log.warn("Could not parse tool arguments: {}", arguments);
            return Map.of();
        }
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return String.valueOf(value);
        }
    }
}
