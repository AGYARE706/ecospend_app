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
 * Service-to-service client that asks the Payment Service to transfer a
 * net payout to the user's MoMo wallet. Called inside the withdrawal
 * transaction: if the payout cannot be initiated, the whole withdrawal
 * rolls back and the vault balance is untouched.
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

    public void requestPayout(
            UUID userId,
            UUID vaultId,
            BigDecimal netAmount,
            String momoNumber,
            String momoProvider,
            String reason) {
        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId.toString());
        body.put("vaultId", vaultId.toString());
        body.put("amount", netAmount);
        body.put("momoNumber", momoNumber);
        body.put("momoProvider", momoProvider);
        body.put("reason", reason);

        try {
            restClient.post()
                    .uri("/payments/internal/payouts")
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Payout of GHS {} to {} initiated for vault {}", netAmount, momoNumber, vaultId);
        } catch (RestClientException e) {
            throw new VaultException(HttpStatus.BAD_GATEWAY,
                    "Payout could not be initiated — withdrawal cancelled: " + e.getMessage());
        }
    }
}
