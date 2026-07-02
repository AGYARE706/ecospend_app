package com.ecospend.notification.services;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Thin client over the Expo Push API (https://docs.expo.dev/push-notifications/sending-notifications/).
 *
 * Sends one or more messages in a single request and inspects the returned
 * tickets. Any token that Expo reports as {@code DeviceNotRegistered} is
 * collected and returned so the caller can prune it from the database.
 */
@Service
public class ExpoPushService {

    private static final Logger log = LoggerFactory.getLogger(ExpoPushService.class);

    private final RestClient expoRestClient;

    public ExpoPushService(RestClient expoRestClient) {
        this.expoRestClient = expoRestClient;
    }

    /**
     * Delivers the same title/body/data to every supplied Expo token.
     *
     * @return the subset of tokens Expo reported as no longer registered.
     *         These should be deleted by the caller.
     */
    public Set<String> send(List<String> tokens, String title, String body, Map<String, Object> data) {
        Set<String> deadTokens = new HashSet<>();
        if (tokens == null || tokens.isEmpty()) {
            return deadTokens;
        }

        List<Map<String, Object>> messages = new ArrayList<>(tokens.size());
        for (String token : tokens) {
            Map<String, Object> message = new java.util.HashMap<>();
            message.put("to", token);
            message.put("title", title);
            message.put("body", body);
            message.put("sound", "default");
            if (data != null && !data.isEmpty()) {
                message.put("data", data);
            }
            messages.add(message);
        }

        try {
            JsonNode response = expoRestClient.post()
                    .body(messages)
                    .retrieve()
                    .body(JsonNode.class);

            collectDeadTokens(tokens, response, deadTokens);
        } catch (Exception ex) {
            // A push failure must never break the calling business flow — the
            // notification is already persisted to the inbox regardless.
            log.error("Expo push delivery failed for {} token(s): {}", tokens.size(), ex.getMessage());
        }

        return deadTokens;
    }

    private void collectDeadTokens(List<String> tokens, JsonNode response, Set<String> deadTokens) {
        if (response == null || !response.has("data")) {
            return;
        }
        JsonNode tickets = response.get("data");
        for (int i = 0; i < tickets.size() && i < tokens.size(); i++) {
            JsonNode ticket = tickets.get(i);
            if ("error".equals(ticket.path("status").asText())) {
                String error = ticket.path("details").path("error").asText("");
                log.warn("Expo push error for token index {}: {}", i, ticket.path("message").asText());
                if ("DeviceNotRegistered".equals(error)) {
                    deadTokens.add(tokens.get(i));
                }
            }
        }
    }
}
