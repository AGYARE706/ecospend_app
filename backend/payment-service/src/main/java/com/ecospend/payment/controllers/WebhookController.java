package com.ecospend.payment.controllers;

import com.ecospend.payment.client.PaystackClient;
import com.ecospend.payment.services.PaymentService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

/**
 * Receives Paystack event callbacks. The endpoint is exempt from JWT auth
 * at the gateway; authenticity comes from the HMAC-SHA512 signature that
 * Paystack computes over the raw body with the secret key.
 *
 * Every event is processed at most once: settlement goes through the same
 * idempotent PENDING → SUCCESS transition as client-initiated verify.
 */
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class WebhookController {

    private static final Logger log = LoggerFactory.getLogger(WebhookController.class);

    private final PaymentService paymentService;
    private final PaystackClient paystackClient;
    private final ObjectMapper objectMapper;

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestHeader(value = "x-paystack-signature", required = false) String signature,
            @RequestBody String rawBody) throws Exception {

        if (!isSignatureValid(signature, rawBody)) {
            log.warn("Rejected webhook with missing or invalid signature");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        JsonNode event = objectMapper.readTree(rawBody);
        String eventType = event.path("event").asText("");
        JsonNode data = event.path("data");
        String reference = data.path("reference").asText("");

        switch (eventType) {
            case "charge.success" -> paymentService.settleDeposit(reference);
            case "charge.failed" -> paymentService.failDeposit(
                    reference, data.path("gateway_response").asText("Charge failed"));
            case "transfer.success" -> paymentService.completeTransfer(reference, true, null);
            case "transfer.failed", "transfer.reversed" -> paymentService.completeTransfer(
                    reference, false, eventType);
            default -> log.info("Ignoring unhandled Paystack event {}", eventType);
        }

        // Always 200 for verified events so Paystack stops retrying.
        return ResponseEntity.ok().build();
    }

    private boolean isSignatureValid(String signature, String rawBody) throws Exception {
        if (paystackClient.isSimulated()) {
            // No secret to sign with in simulated mode; accept for local demos.
            return true;
        }
        if (signature == null || signature.isBlank()) {
            return false;
        }

        Mac mac = Mac.getInstance("HmacSHA512");
        mac.init(new SecretKeySpec(
                paystackClient.secretKey().getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
        String expected = HexFormat.of().formatHex(
                mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8)));

        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                signature.toLowerCase().getBytes(StandardCharsets.UTF_8));
    }
}
