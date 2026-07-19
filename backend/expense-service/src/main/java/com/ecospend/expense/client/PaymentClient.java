package com.ecospend.expense.client;

import com.ecospend.expense.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Service-to-service client for the payment-service wallet. Used by
 * money-backed finance operations (goal contributions/withdrawals, bill
 * payments): the wallet is the single real balance, so these calls are
 * made inside the local transaction — if the wallet move fails, the
 * local change rolls back.
 */
@Component
public class PaymentClient {

    private static final Logger log = LoggerFactory.getLogger(PaymentClient.class);

    private final RestClient restClient;

    public PaymentClient(@Value("${payment-service.base-url}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /** Debits the user's wallet; 400 from the wallet becomes a clean client error. */
    public void debitWallet(UUID userId, BigDecimal amount, String reference) {
        exchange("/payments/internal/debits", userId, amount, reference);
    }

    /** Credits the user's wallet (e.g. a goal withdrawal paid back to it). */
    public void creditWallet(UUID userId, BigDecimal amount, String reference) {
        exchange("/payments/internal/credits", userId, amount, reference);
    }

    private void exchange(String path, UUID userId, BigDecimal amount, String reference) {
        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId.toString());
        body.put("amount", amount);
        body.put("reference", reference);
        // The expense service records its own transaction rows, so the
        // wallet must not auto-record a second one.
        body.put("record", false);

        try {
            restClient.post().uri(path).body(body).retrieve().toBodilessEntity();
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().value() == 400) {
                throw new BadRequestException("Insufficient wallet balance");
            }
            log.error("Wallet call {} failed: {}", path, e.getMessage());
            throw new IllegalStateException("Wallet operation failed");
        } catch (RestClientException e) {
            log.error("Wallet service unreachable for {}: {}", path, e.getMessage());
            throw new IllegalStateException("Wallet service unavailable");
        }
    }
}
