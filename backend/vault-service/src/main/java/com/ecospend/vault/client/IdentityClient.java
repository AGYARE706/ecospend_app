package com.ecospend.vault.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

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
    public record IdMatch(String phoneNumber, UUID userId, String name) {}

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

    /**
     * Resolves group vault member ids to display names only — phone numbers
     * are deliberately not surfaced to other group members. Best-effort,
     * like {@link #lookupByPhone}: an unreachable identity-service yields an
     * empty map rather than failing the group vault details request.
     */
    public Map<UUID, String> lookupByIds(List<UUID> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Map.of();
        }
        try {
            IdMatch[] result = restClient.post()
                    .uri("/users/internal/lookup-by-ids")
                    .body(Map.of("userIds", userIds))
                    .retrieve()
                    .body(IdMatch[].class);
            if (result == null) {
                return Map.of();
            }
            return Arrays.stream(result)
                    .collect(Collectors.toMap(IdMatch::userId, IdMatch::name));
        } catch (RestClientException e) {
            log.warn("Could not resolve group vault member names: {}", e.getMessage());
            return Map.of();
        }
    }
}
