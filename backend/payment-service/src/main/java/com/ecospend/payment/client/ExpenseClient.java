package com.ecospend.payment.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Auto-records income/expense transactions in the expense service so
 * every real money move shows up in the user's transaction feed without
 * manual entry. Best-effort by design: a bookkeeping failure must never
 * fail or roll back the money movement itself, so errors are only logged.
 */
@Component
public class ExpenseClient {

    private static final Logger log = LoggerFactory.getLogger(ExpenseClient.class);

    private final RestClient restClient;

    public ExpenseClient(@Value("${expense-service.base-url}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public void recordTransaction(
            UUID userId, BigDecimal amount, String type, String category, String notes) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("userId", userId.toString());
            body.put("amount", amount);
            body.put("type", type);
            body.put("category", category == null ? "Other" : category);
            body.put("notes", notes == null ? "" : notes);

            restClient.post()
                    .uri("/finance/internal/transactions")
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            log.warn("Auto-record failed ({} {} GHS {}): {}", type, category, amount, e.getMessage());
        }
    }
}
