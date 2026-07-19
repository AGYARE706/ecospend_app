package com.ecospend.payment.client;

import com.ecospend.payment.exceptions.PaymentException;
import com.fasterxml.jackson.databind.JsonNode;
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

/**
 * The only class in EcoSpend that talks to Paystack.
 *
 * Two modes, decided by whether PAYSTACK_SECRET_KEY is set:
 *  - Real mode: calls the Paystack test API (initialize, verify,
 *    transfer recipient, transfer) with the sk_test key.
 *  - Simulated mode (blank key): returns deterministic success responses
 *    so the full deposit/payout flow can be demonstrated locally without
 *    a Paystack account. The rest of the system cannot tell the difference.
 */
@Component
public class PaystackClient {

    private static final Logger log = LoggerFactory.getLogger(PaystackClient.class);

    private final String secretKey;
    private final String callbackUrl;
    private final RestClient restClient;

    public PaystackClient(
            @Value("${paystack.secret-key}") String secretKey,
            @Value("${paystack.base-url}") String baseUrl,
            @Value("${paystack.callback-url}") String callbackUrl) {
        this.secretKey = secretKey == null ? "" : secretKey.trim();
        this.callbackUrl = callbackUrl;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + this.secretKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public boolean isSimulated() {
        return secretKey.isEmpty();
    }

    public String secretKey() {
        return secretKey;
    }

    public record InitializeResult(String authorizationUrl, String accessCode) {}

    public record VerifyResult(boolean success, String gatewayResponse) {}

    public record TransferResult(boolean success, String transferCode, String message) {}

    /**
     * Starts a checkout for the given amount. Paystack requires an email;
     * EcoSpend users only have phone numbers, so a synthetic address is
     * derived from the phone.
     */
    public InitializeResult initializeTransaction(String reference, BigDecimal amountGhs, String userPhone) {
        if (isSimulated()) {
            log.info("[SIMULATED] initialize {} GHS {} — auto-approving", reference, amountGhs);
            return new InitializeResult("https://checkout.paystack.com/simulated/" + reference, "sim_" + reference);
        }

        try {
            JsonNode body = restClient.post()
                    .uri("/transaction/initialize")
                    .body(Map.of(
                            "email", syntheticEmail(userPhone),
                            "amount", toPesewas(amountGhs),
                            "currency", "GHS",
                            "reference", reference,
                            "callback_url", callbackUrl))
                    .retrieve()
                    .body(JsonNode.class);

            requireStatusTrue(body, "initialize transaction");
            JsonNode data = body.get("data");
            return new InitializeResult(
                    data.get("authorization_url").asText(),
                    data.get("access_code").asText());
        } catch (RestClientException e) {
            throw PaymentException.upstream("Paystack initialize failed: " + e.getMessage());
        }
    }

    public VerifyResult verifyTransaction(String reference) {
        if (isSimulated()) {
            log.info("[SIMULATED] verify {} — success", reference);
            return new VerifyResult(true, "Approved (simulated)");
        }

        try {
            JsonNode body = restClient.get()
                    .uri("/transaction/verify/{reference}", reference)
                    .retrieve()
                    .body(JsonNode.class);

            requireStatusTrue(body, "verify transaction");
            JsonNode data = body.get("data");
            boolean success = "success".equals(data.get("status").asText());
            String gatewayResponse = data.has("gateway_response")
                    ? data.get("gateway_response").asText()
                    : data.get("status").asText();
            return new VerifyResult(success, gatewayResponse);
        } catch (RestClientException e) {
            throw PaymentException.upstream("Paystack verify failed: " + e.getMessage());
        }
    }

    /**
     * Creates a MoMo transfer recipient and initiates a transfer of the
     * given amount to it. Returns the transfer code for webhook matching.
     */
    public TransferResult transferToMomo(
            String reference,
            BigDecimal amountGhs,
            String momoNumber,
            String momoProvider,
            String recipientName,
            String reason) {
        if (isSimulated()) {
            log.info("[SIMULATED] transfer {} GHS {} to {} ({}) — success",
                    reference, amountGhs, momoNumber, momoProvider);
            return new TransferResult(true, "sim_trf_" + reference, "Transfer complete (simulated)");
        }

        try {
            JsonNode recipientBody = restClient.post()
                    .uri("/transferrecipient")
                    .body(Map.of(
                            "type", "mobile_money",
                            "name", recipientName,
                            "account_number", momoNumber,
                            "bank_code", momoProviderToBankCode(momoProvider),
                            "currency", "GHS"))
                    .retrieve()
                    .body(JsonNode.class);
            requireStatusTrue(recipientBody, "create transfer recipient");
            String recipientCode = recipientBody.get("data").get("recipient_code").asText();

            JsonNode transferBody = restClient.post()
                    .uri("/transfer")
                    .body(Map.of(
                            "source", "balance",
                            "amount", toPesewas(amountGhs),
                            "reference", reference,
                            "recipient", recipientCode,
                            "reason", reason))
                    .retrieve()
                    .body(JsonNode.class);
            requireStatusTrue(transferBody, "initiate transfer");
            JsonNode data = transferBody.get("data");
            return new TransferResult(
                    true,
                    data.get("transfer_code").asText(),
                    data.has("status") ? data.get("status").asText() : "pending");
        } catch (RestClientException e) {
            throw PaymentException.upstream("Paystack transfer failed: " + e.getMessage());
        }
    }

    private static void requireStatusTrue(JsonNode body, String action) {
        if (body == null || !body.path("status").asBoolean(false)) {
            String message = body == null ? "empty response" : body.path("message").asText("unknown error");
            throw PaymentException.upstream("Paystack " + action + " rejected: " + message);
        }
    }

    private static long toPesewas(BigDecimal amountGhs) {
        return amountGhs.multiply(BigDecimal.valueOf(100)).longValueExact();
    }

    private static String syntheticEmail(String phone) {
        String digits = phone == null ? "user" : phone.replaceAll("\\D", "");
        return digits + "@ecospend.app";
    }

    private static String momoProviderToBankCode(String provider) {
        return switch (provider == null ? "" : provider.toUpperCase()) {
            case "MTN" -> "MTN";
            case "TELECEL", "VODAFONE" -> "VOD";
            case "AT", "AIRTELTIGO" -> "ATL";
            default -> "MTN";
        };
    }
}
