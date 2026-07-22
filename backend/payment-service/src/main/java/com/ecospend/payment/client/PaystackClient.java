package com.ecospend.payment.client;

import com.ecospend.payment.exceptions.PaymentException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * The only class in EcoSpend that talks to Paystack.
 *
 * Deposits (initialize/verify) and transfers (payouts) simulate
 * independently:
 *  - Deposits: real when PAYSTACK_SECRET_KEY is set, simulated when blank.
 *  - Transfers: simulated whenever deposits are simulated, OR whenever
 *    PAYSTACK_TRANSFERS_SIMULATED is true (the default) — because Paystack
 *    rejects third-party payouts outright for a "Starter" business, an
 *    account/KYC restriction no request can work around. Simulated
 *    responses are deterministic successes, so the full deposit/payout
 *    flow can be demonstrated without a verified Paystack business; the
 *    rest of the system cannot tell the difference.
 */
@Component
public class PaystackClient {

    private static final Logger log = LoggerFactory.getLogger(PaystackClient.class);
    private static final ObjectMapper ERROR_MAPPER = new ObjectMapper();

    private final String secretKey;
    private final String callbackUrl;
    private final boolean transfersSimulated;
    private final RestClient restClient;

    public PaystackClient(
            @Value("${paystack.secret-key}") String secretKey,
            @Value("${paystack.base-url}") String baseUrl,
            @Value("${paystack.callback-url}") String callbackUrl,
            @Value("${paystack.transfers-simulated:true}") boolean transfersSimulated) {
        this.secretKey = secretKey == null ? "" : secretKey.trim();
        this.callbackUrl = callbackUrl;
        this.transfersSimulated = transfersSimulated;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + this.secretKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public boolean isSimulated() {
        return secretKey.isEmpty();
    }

    /**
     * Paystack rejects third-party payouts outright for any business still
     * on its "Starter" tier — an account/KYC restriction with no request-side
     * workaround. Deposits can still hit real Paystack (isSimulated()) while
     * transfers simulate independently, so Send Money keeps working before
     * the business is verified.
     */
    public boolean isTransfersSimulated() {
        return isSimulated() || transfersSimulated;
    }

    public String secretKey() {
        return secretKey;
    }

    public record InitializeResult(String authorizationUrl, String accessCode) {}

    public record VerifyResult(boolean success, String gatewayResponse) {}

    /** {@code status} is Paystack's own transfer status ("success", "pending", "otp", ...) — never a free-text message. */
    public record TransferResult(String transferCode, String status) {}

    /**
     * Starts a checkout for the given amount. Paystack requires an email;
     * EcoSpend users only have phone numbers, so a synthetic address is
     * derived from the phone.
     *
     * @param redirectUrlOverride the client's own deep link (Linking.createURL),
     *     used as the Paystack callback_url when present. This must win over
     *     the configured default — Expo Go and standalone builds resolve
     *     Linking.createURL to different schemes, so the app that actually
     *     opened the checkout is the only one that knows what it can catch.
     */
    public InitializeResult initializeTransaction(
            String reference, BigDecimal amountGhs, String userPhone, String redirectUrlOverride) {
        if (isSimulated()) {
            log.info("[SIMULATED] initialize {} GHS {} — auto-approving", reference, amountGhs);
            return new InitializeResult("https://checkout.paystack.com/simulated/" + reference, "sim_" + reference);
        }

        String effectiveCallbackUrl =
                (redirectUrlOverride == null || redirectUrlOverride.isBlank())
                        ? callbackUrl
                        : redirectUrlOverride.trim();

        // custom_fields is Paystack's standard way to attach business context
        // to a transaction (shown on the dashboard/receipt) — without it,
        // nothing in the request identifies this charge as an EcoSpend
        // wallet top-up.
        Map<String, Object> metadata = Map.of(
                "custom_fields", List.of(Map.of(
                        "display_name", "Purpose",
                        "variable_name", "purpose",
                        "value", "EcoSpend Wallet Top-up")));

        try {
            JsonNode body = restClient.post()
                    .uri("/transaction/initialize")
                    .body(Map.of(
                            "email", syntheticEmail(userPhone),
                            "amount", toPesewas(amountGhs),
                            "currency", "GHS",
                            "reference", reference,
                            "callback_url", effectiveCallbackUrl,
                            "metadata", metadata))
                    .retrieve()
                    .body(JsonNode.class);

            requireStatusTrue(body, "initialize transaction");
            JsonNode data = body.get("data");
            return new InitializeResult(
                    data.get("authorization_url").asText(),
                    data.get("access_code").asText());
        } catch (RestClientException e) {
            String detail = describeError(e);
            log.error("Paystack initialize transaction failed: {}", detail, e);
            throw PaymentException.upstream("Paystack initialize failed: " + detail);
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
            String detail = describeError(e);
            log.error("Paystack verify transaction failed: {}", detail, e);
            throw PaymentException.upstream("Paystack verify failed: " + detail);
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
        if (isTransfersSimulated()) {
            String simReason = isSimulated() ? "no secret key configured" : "Starter-tier payouts disabled";
            log.info("[SIMULATED, {}] transfer {} GHS {} to {} ({}) — success",
                    simReason, reference, amountGhs, momoNumber, momoProvider);
            return new TransferResult("sim_trf_" + reference, "success");
        }

        String recipientCode;
        try {
            JsonNode recipientBody = restClient.post()
                    .uri("/transferrecipient")
                    .body(Map.of(
                            "type", "mobile_money",
                            "name", recipientName,
                            "account_number", normalizeGhanaMomoNumber(momoNumber),
                            "bank_code", momoProviderToBankCode(momoProvider),
                            "currency", "GHS"))
                    .retrieve()
                    .body(JsonNode.class);
            requireStatusTrue(recipientBody, "create transfer recipient");
            recipientCode = recipientBody.get("data").get("recipient_code").asText();
        } catch (RestClientException e) {
            String detail = describeError(e);
            log.error("Paystack transfer-recipient creation failed: {}", detail, e);
            throw PaymentException.upstream("Could not create the transfer recipient: " + detail);
        }

        try {
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
                    data.get("transfer_code").asText(),
                    data.has("status") ? data.get("status").asText() : "pending");
        } catch (RestClientException e) {
            String detail = describeError(e);
            log.error("Paystack transfer initiation failed: {}", detail, e);
            throw PaymentException.upstream("Could not initiate the transfer: " + detail);
        }
    }

    /**
     * Paystack's Ghana mobile_money account_number expects a consistent
     * local format — the mobile app accepts both "0XXXXXXXXX" and
     * "+233XXXXXXXXX", so a raw "+233..." number reaching Paystack
     * unmodified is a plausible rejection cause.
     */
    private static String normalizeGhanaMomoNumber(String momoNumber) {
        if (momoNumber == null) {
            return momoNumber;
        }
        String trimmed = momoNumber.trim();
        if (trimmed.startsWith("+233")) {
            return "0" + trimmed.substring(4);
        }
        return trimmed;
    }

    /**
     * Extracts Paystack's own {@code message} field from a failed response
     * body when possible, so callers see the real rejection reason instead
     * of a bare status code.
     */
    private static String describeError(RestClientException e) {
        if (e instanceof HttpStatusCodeException httpEx) {
            String body = httpEx.getResponseBodyAsString();
            if (body != null && !body.isBlank()) {
                try {
                    JsonNode node = ERROR_MAPPER.readTree(body);
                    if (node.hasNonNull("message")) {
                        return node.get("message").asText();
                    }
                } catch (Exception ignored) {
                    // body wasn't JSON — fall through to the raw text below
                }
                return body;
            }
            return "HTTP " + httpEx.getStatusCode();
        }
        return e.getMessage();
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
