package com.ecospend.payment.client;

import com.ecospend.payment.exceptions.PaymentException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * Service-to-service client that credits a vault once a deposit has been
 * verified. Calls the vault-service internal endpoint directly on the
 * Docker network — the gateway blocks /internal/ paths from the outside.
 */
@Component
public class VaultClient {

    private static final Logger log = LoggerFactory.getLogger(VaultClient.class);

    private final RestClient restClient;

    public VaultClient(@Value("${vault-service.base-url}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public void creditVault(UUID userId, UUID vaultId, BigDecimal amountGhs, String reference) {
        try {
            restClient.post()
                    .uri("/vault/internal/deposits")
                    .body(Map.of(
                            "userId", userId.toString(),
                            "vaultId", vaultId.toString(),
                            "amount", amountGhs,
                            "reference", reference))
                    .retrieve()
                    .toBodilessEntity();
            log.info("Credited vault {} with GHS {} for deposit {}", vaultId, amountGhs, reference);
        } catch (RestClientException e) {
            throw PaymentException.upstream(
                    "Vault credit failed for deposit " + reference + ": " + e.getMessage());
        }
    }
}
