package com.ecospend.vault.client;

import com.ecospend.vault.exceptions.VaultException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Service-to-service client that credits the user's central wallet with
 * a net payout (withdrawal, break, approved group withdrawal, exit).
 * Called inside the vault transaction: if the wallet credit cannot be
 * made, the whole operation rolls back and balances are untouched.
 * The payment-service auto-records an INCOME transaction for the credit.
 */
@Component
public class PaymentClient {

    private static final Logger log = LoggerFactory.getLogger(PaymentClient.class);

    private final RestClient restClient;

    public PaymentClient(
            @Value("${payment-service.base-url:http://payment-service:8085}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public void creditWallet(UUID userId, BigDecimal netAmount, String reference, String note) {
        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId.toString());
        body.put("amount", netAmount);
        body.put("reference", reference);
        body.put("category", "Savings");
        body.put("note", note);
        body.put("record", true);

        try {
            restClient.post()
                    .uri("/payments/internal/credits")
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Credited wallet of {} with GHS {} ({})", userId, netAmount, reference);
        } catch (RestClientException e) {
            throw new VaultException(HttpStatus.BAD_GATEWAY,
                    "Wallet payout could not be completed — operation cancelled: " + e.getMessage());
        }
    }
}
