package com.ecospend.expense.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.UUID;

/**
 * Read-only service-to-service client for vault-service, used only by the
 * AI coach's get_vault_summary tool. Best-effort: unlike PaymentClient
 * (real money, must fail loudly), a vault lookup failure should just tell
 * the model vault data isn't available right now, not break the chat turn.
 */
@Component
public class VaultClient {

    private static final Logger log = LoggerFactory.getLogger(VaultClient.class);

    private final RestClient restClient;

    public VaultClient(@Value("${vault-service.base-url}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    /** Returns the raw JSON body from vault-service's internal summary endpoint. */
    public String getSummaryJson(UUID userId) {
        try {
            return restClient.get()
                    .uri("/vault/internal/summary?userId={userId}", userId)
                    .retrieve()
                    .body(String.class);
        } catch (RestClientException e) {
            log.warn("Could not fetch vault summary for {}: {}", userId, e.getMessage());
            return "{\"error\": \"Vault information is currently unavailable.\"}";
        }
    }
}
