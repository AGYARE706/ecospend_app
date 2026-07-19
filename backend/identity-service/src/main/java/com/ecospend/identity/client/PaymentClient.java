package com.ecospend.identity.client;

import com.ecospend.identity.exception.PaymentRequiredException;
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
 * Charges the user's central wallet for the Plus upgrade via the
 * payment-service internal debit endpoint (gateway-denied from outside).
 * The payment-service auto-records the EXPENSE transaction.
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

    public void chargeWallet(UUID userId, BigDecimal amount, String reference, String note) {
        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId.toString());
        body.put("amount", amount);
        body.put("reference", reference);
        body.put("category", "Subscription");
        body.put("note", note);
        body.put("record", true);

        try {
            restClient.post()
                    .uri("/payments/internal/debits")
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Charged wallet of {} GHS {} for {}", userId, amount, note);
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().value() == 400) {
                throw new PaymentRequiredException(
                        "Insufficient wallet balance — top up your wallet to upgrade");
            }
            throw new PaymentRequiredException("Payment failed — please try again");
        } catch (RestClientException e) {
            log.error("Wallet charge failed: {}", e.getMessage());
            throw new PaymentRequiredException("Payment service unavailable — please try again");
        }
    }
}
