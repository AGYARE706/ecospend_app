package com.ecospend.expense.client;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.FunctionCall;
import com.google.genai.types.FunctionDeclaration;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.google.genai.types.Tool;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Thin wrapper around the Google Gen AI Java SDK for "Abena". Two entry
 * points: {@link #runToolLoop} drives the grounded chat/insight tool-use
 * loop, {@link #narrate} is a single plain call used for cheap one-sentence
 * narration. Disabled entirely (see {@link #isConfigured()}) when no API
 * key is set — callers must check this before calling either method, no
 * simulated fallback is provided.
 */
@Component
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);
    private static final int MAX_TOOL_ITERATIONS = 6;

    private final Client client;
    private final boolean configured;
    private final String chatModel;
    private final String narrationModel;

    public GeminiClient(
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.chat-model}") String chatModel,
            @Value("${gemini.narration-model}") String narrationModel) {
        this.configured = apiKey != null && !apiKey.isBlank();
        this.client = configured ? Client.builder().apiKey(apiKey).build() : null;
        this.chatModel = chatModel;
        this.narrationModel = narrationModel;
    }

    public boolean isConfigured() {
        return configured;
    }

    @FunctionalInterface
    public interface ToolExecutor {
        /** Returns a Map (used as-is) or any other value (wrapped under a "result" key) — see {@link #runToolLoop}. */
        Object execute(String toolName, Map<String, Object> args);
    }

    /**
     * Runs the manual tool-use loop: call the model, execute any requested
     * tools against real data via {@code executor}, feed the results back,
     * repeat until Gemini stops calling tools. Returns the concatenated
     * text of the final turn.
     */
    public String runToolLoop(
            String systemPrompt, List<Content> history, List<FunctionDeclaration> functionDeclarations, ToolExecutor executor) {
        List<Content> contents = new ArrayList<>(history);

        GenerateContentConfig config = GenerateContentConfig.builder()
                .systemInstruction(Content.fromParts(Part.fromText(systemPrompt)))
                .tools(Tool.builder().functionDeclarations(functionDeclarations).build())
                .maxOutputTokens(2048)
                .build();

        for (int iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
            GenerateContentResponse response = client.models.generateContent(chatModel, contents, config);

            List<FunctionCall> functionCalls = response.functionCalls();
            if (functionCalls == null || functionCalls.isEmpty()) {
                String text = response.text();
                return text != null ? text : "";
            }

            List<Part> modelParts = new ArrayList<>();
            List<Part> responseParts = new ArrayList<>();
            for (FunctionCall call : functionCalls) {
                String name = call.name().orElse("");
                Map<String, Object> args = call.args().orElse(Map.of());
                modelParts.add(Part.fromFunctionCall(name, args));

                Object result;
                try {
                    result = executor.execute(name, args);
                } catch (Exception e) {
                    log.warn("Coach tool {} failed: {}", name, e.getMessage());
                    result = "This tool failed to run: " + e.getMessage();
                }
                responseParts.add(Part.fromFunctionResponse(name, asResponseMap(result)));
            }

            contents.add(Content.builder().role("model").parts(modelParts).build());
            contents.add(Content.builder().role("user").parts(responseParts).build());
        }

        log.warn("Coach tool loop hit the {} iteration cap without finishing", MAX_TOOL_ITERATIONS);
        return "I wasn't able to finish looking that up — please try asking again.";
    }

    /** Single, non-tool call for cheap narration (e.g. anomaly alerts, daily insight). */
    public String narrate(String systemPrompt, String userPrompt) {
        GenerateContentConfig config = GenerateContentConfig.builder()
                .systemInstruction(Content.fromParts(Part.fromText(systemPrompt)))
                .maxOutputTokens(300)
                .build();

        GenerateContentResponse response = client.models.generateContent(narrationModel, userPrompt, config);
        String text = response.text();
        return text != null ? text : "";
    }

    /** A functionResponse's payload must be a JSON object — anything not already a Map (a list, string, error) gets wrapped. */
    @SuppressWarnings("unchecked")
    private static Map<String, Object> asResponseMap(Object result) {
        if (result instanceof Map) {
            return (Map<String, Object>) result;
        }
        return Map.of("result", result);
    }
}
