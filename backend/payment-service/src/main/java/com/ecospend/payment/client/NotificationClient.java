package com.ecospend.payment.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Sends alerts through the notification-service (inbox + Expo push).
 * Best-effort: a notification failure must never break the payment flow,
 * so errors are only logged.
 */
@Component
public class NotificationClient {

    private static final Logger log = LoggerFactory.getLogger(NotificationClient.class);

    private final RestClient restClient;

    public NotificationClient(
            @Value("${notification-service.base-url:http://notification-service:8084}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public void send(UUID userId, String title, String body, String type, Map<String, Object> data) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", userId.toString());
        payload.put("title", title);
        payload.put("body", body);
        payload.put("type", type);
        payload.put("data", data);

        try {
            restClient.post().uri("/notifications/send").body(payload).retrieve().toBodilessEntity();
        } catch (RestClientException e) {
            log.warn("Could not send notification to {}: {}", userId, e.getMessage());
        }
    }
}
