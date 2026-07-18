package com.ecospend.identity.client;

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
 * Fires best-effort engagement events (badges/streaks/XP) — mirrors
 * NotificationClient exactly: a failure here must never break the
 * identity flow, so errors are only logged.
 */
@Component
public class EngagementClient {

    private static final Logger log = LoggerFactory.getLogger(EngagementClient.class);

    private final RestClient restClient;

    public EngagementClient(
            @Value("${engagement-service.base-url:http://engagement-service:8086}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public void fire(UUID userId, String type, Map<String, Object> metadata) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", userId.toString());
        payload.put("type", type);
        payload.put("metadata", metadata);

        try {
            restClient.post().uri("/engagement/internal/events").body(payload).retrieve().toBodilessEntity();
        } catch (RestClientException e) {
            log.warn("Could not fire engagement event {} for {}: {}", type, userId, e.getMessage());
        }
    }
}
