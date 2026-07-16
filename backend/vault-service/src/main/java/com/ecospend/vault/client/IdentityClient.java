package com.ecospend.vault.client;

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
import java.util.UUID;

/**
 * Resolves invitee phone numbers to registered EcoSpend users. Best-effort:
 * if identity-service is unreachable, invites are still recorded with no
 * resolved user (the admin can see who was invited even if we temporarily
 * can't tell whether they're already on EcoSpend), so a lookup failure
 * never blocks group vault creation.
 */
@Component
public class IdentityClient {

    private static final Logger log = LoggerFactory.getLogger(IdentityClient.class);

    private final RestClient restClient;

    public IdentityClient(
            @Value("${identity-service.base-url:http://identity-service:8081}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public record PhoneMatch(String phoneNumber, UUID userId, String name) {}

    public List<PhoneMatch> lookupByPhone(List<String> phoneNumbers) {
        if (phoneNumbers == null || phoneNumbers.isEmpty()) {
            return List.of();
        }
        try {
            PhoneMatch[] result = restClient.post()
                    .uri("/users/internal/lookup-by-phone")
                    .body(Map.of("phoneNumbers", phoneNumbers))
                    .retrieve()
                    .body(PhoneMatch[].class);
            return result == null ? List.of() : List.of(result);
        } catch (RestClientException e) {
            log.warn("Could not resolve invitee phone numbers: {}", e.getMessage());
            return List.of();
        }
    }
}
