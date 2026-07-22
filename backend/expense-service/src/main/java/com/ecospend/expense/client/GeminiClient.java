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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * The only class that talks to Gemini (Google AI) for "Abena". Uses the
 * generateContent REST API with function calling. Two entry points:
 * {@link #runToolLoop} drives the grounded chat/insight tool-use loop and
 * {@link #narrate} is a single plain call for cheap one-sentence narration.
 * Disabled entirely (see {@link #isConfigured()}) when no API key is set —
 * callers must check this first; no simulated fallback is provided.
 */
@Component
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);
    private static final int MAX_TOOL_ITERATIONS = 6;

    private final boolean configured;
    private final String chatModel;
    private final String narrationModel;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GeminiClient(
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta}") String baseUrl,
            @Value("${gemini.chat-model}") String chatModel,
            @Value("${gemini.narration-model}") String narrationModel,
            ObjectMapper objectMapper) {
        this.configured = apiKey != null && !apiKey.isBlank();
        this.chatModel = chatModel;
        this.narrationModel = narrationModel;
        this.objectMapper = objectMapper;
        this.restClient = configured
                ? RestClient.builder()
                        .baseUrl(baseUrl)
                        .defaultHeader("x-goog-api-key", apiKey.trim())
                        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                        .build()
                : null;
    }

    public boolean isConfigured() {
        return configured;
    }

    /** One prior conversation turn. {@code role} is "user" or "assistant" — translated to Gemini's "user"/"model". */
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
     * repeat until Gemini stops calling tools. Returns the final assistant text.
     */
    public String runToolLoop(
            String systemPrompt, List<ChatTurn> history, List<ToolSpec> tools, ToolExecutor executor) {
        ArrayNode contents = objectMapper.createArrayNode();
        for (ChatTurn turn : history) {
            contents.add(turnToContent(turn));
        }
        ArrayNode functionDeclarations = toolsToJson(tools);

        for (int iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
            JsonNode modelContent = callGenerate(chatModel, systemPrompt, contents, functionDeclarations, 2048);
            JsonNode parts = modelContent.path("parts");

            List<JsonNode> functionCalls = new ArrayList<>();
            StringBuilder text = new StringBuilder();
            for (JsonNode part : parts) {
                if (part.has("functionCall")) {
                    functionCalls.add(part.get("functionCall"));
                } else if (part.has("text")) {
                    text.append(part.get("text").asText(""));
                }
            }

            if (functionCalls.isEmpty()) {
                return text.toString();
            }

            // Echo the model's turn (its functionCall parts) back into history.
            ObjectNode modelTurn = objectMapper.createObjectNode();
            modelTurn.put("role", "model");
            modelTurn.set("parts", parts);
            contents.add(modelTurn);

            // Answer every call from this turn in one turn — Gemini accepts
            // multiple functionResponse parts together. The current API
            // rejects role "function" outright (verified live against the
            // real endpoint: "Role 'function' is not supported... USER,
            // ASSISTANT, ... MODEL") despite older docs/cookbook examples
            // showing it — function results go under "user" now.
            ObjectNode functionTurn = objectMapper.createObjectNode();
            functionTurn.put("role", "user");
            ArrayNode functionParts = objectMapper.createArrayNode();
            for (JsonNode call : functionCalls) {
                String name = call.path("name").asText("");
                Map<String, Object> args = argsToMap(call.path("args"));

                Object result;
                try {
                    result = executor.execute(name, args);
                } catch (Exception e) {
                    log.warn("Coach tool {} failed: {}", name, e.getMessage());
                    result = Map.of("error", "This tool failed to run: " + e.getMessage());
                }
                functionParts.add(functionResponsePart(name, result));
            }
            functionTurn.set("parts", functionParts);
            contents.add(functionTurn);
        }

        log.warn("Coach tool loop hit the {} iteration cap without finishing", MAX_TOOL_ITERATIONS);
        return "I wasn't able to finish looking that up — please try asking again.";
    }

    /** Single, non-tool call for cheap narration (e.g. anomaly alerts, daily insight). */
    public String narrate(String systemPrompt, String userPrompt) {
        ArrayNode contents = objectMapper.createArrayNode();
        contents.add(turnToContent(new ChatTurn("user", userPrompt)));

        // 300 wasn't enough headroom above this model generation's mandatory
        // ~250-350 "thinking" tokens (see callGenerate) — verified live that
        // it truncated a one-sentence narration to nothing.
        JsonNode modelContent = callGenerate(narrationModel, systemPrompt, contents, null, 1024);
        StringBuilder text = new StringBuilder();
        for (JsonNode part : modelContent.path("parts")) {
            if (part.has("text")) {
                text.append(part.get("text").asText(""));
            }
        }
        return text.toString();
    }

    /** POSTs a generateContent request and returns candidates[0].content. */
    private JsonNode callGenerate(
            String model, String systemPrompt, ArrayNode contents, ArrayNode functionDeclarations, int maxTokens) {
        ObjectNode body = objectMapper.createObjectNode();

        ObjectNode systemInstruction = objectMapper.createObjectNode();
        ArrayNode systemParts = objectMapper.createArrayNode();
        systemParts.add(objectMapper.createObjectNode().put("text", systemPrompt));
        systemInstruction.set("parts", systemParts);
        body.set("systemInstruction", systemInstruction);

        body.set("contents", contents);

        if (functionDeclarations != null && !functionDeclarations.isEmpty()) {
            ObjectNode toolsEntry = objectMapper.createObjectNode();
            toolsEntry.set("functionDeclarations", functionDeclarations);
            ArrayNode toolsArray = objectMapper.createArrayNode();
            toolsArray.add(toolsEntry);
            body.set("tools", toolsArray);
        }

        ObjectNode generationConfig = objectMapper.createObjectNode();
        generationConfig.put("maxOutputTokens", maxTokens);
        // This model generation spends part of maxOutputTokens on invisible
        // internal "thinking" before the visible answer, and — verified live
        // against the real API — can't be fully turned off (thinkingBudget:0
        // is rejected outright; even the lowest thinkingLevel still burns
        // ~250-350 tokens on thinking). That silently truncated the short
        // narration prompt's 300-token budget down to a cut-off "HEADING:
        // ...\nMESSAGE" with no content. Ask for the lowest level and size
        // maxTokens (see call sites) with enough headroom to absorb it.
        generationConfig.set("thinkingConfig", objectMapper.createObjectNode().put("thinkingLevel", "LOW"));
        body.set("generationConfig", generationConfig);

        try {
            JsonNode response = restClient.post()
                    .uri("/models/{model}:generateContent", model)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
            if (response == null) {
                throw new IllegalStateException("Empty response from Gemini");
            }
            JsonNode content = response.path("candidates").path(0).path("content");
            if (content.isMissingNode()) {
                // No candidate at all usually means the prompt or response was
                // blocked — surface why instead of a blank/confusing failure.
                String blockReason = response.path("promptFeedback").path("blockReason").asText("unknown reason");
                throw new IllegalStateException("Gemini returned no response (" + blockReason + ")");
            }
            return content;
        } catch (RestClientException e) {
            throw new IllegalStateException("Gemini request failed: " + e.getMessage(), e);
        }
    }

    private ObjectNode turnToContent(ChatTurn turn) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("role", "assistant".equals(turn.role()) ? "model" : "user");
        ArrayNode parts = objectMapper.createArrayNode();
        parts.add(objectMapper.createObjectNode().put("text", turn.content() == null ? "" : turn.content()));
        node.set("parts", parts);
        return node;
    }

    private ObjectNode functionResponsePart(String name, Object result) {
        ObjectNode functionResponse = objectMapper.createObjectNode();
        functionResponse.put("name", name);
        ObjectNode responseWrapper = objectMapper.createObjectNode();
        responseWrapper.set("content", objectMapper.valueToTree(result));
        functionResponse.set("response", responseWrapper);

        ObjectNode part = objectMapper.createObjectNode();
        part.set("functionResponse", functionResponse);
        return part;
    }

    private ArrayNode toolsToJson(List<ToolSpec> tools) {
        ArrayNode array = objectMapper.createArrayNode();
        for (ToolSpec tool : tools) {
            ObjectNode fn = objectMapper.createObjectNode();
            fn.put("name", tool.name());
            fn.put("description", tool.description());
            fn.set("parameters", objectMapper.valueToTree(tool.parameters()));
            array.add(fn);
        }
        return array;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> argsToMap(JsonNode args) {
        if (args == null || args.isMissingNode() || args.isNull()) {
            return Map.of();
        }
        try {
            return objectMapper.convertValue(args, Map.class);
        } catch (Exception e) {
            log.warn("Could not read tool arguments: {}", args);
            return Map.of();
        }
    }
}
