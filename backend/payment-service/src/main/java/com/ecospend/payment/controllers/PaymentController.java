package com.ecospend.payment.controllers;

import com.ecospend.payment.dto.DepositView;
import com.ecospend.payment.dto.InitializeDepositRequest;
import com.ecospend.payment.dto.PayoutRequest;
import com.ecospend.payment.models.PaymentRecord;
import com.ecospend.payment.services.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/deposits")
    public ResponseEntity<DepositView> initializeDeposit(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody InitializeDepositRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.initializeDeposit(userId, request));
    }

    @GetMapping("/deposits/{reference}")
    public ResponseEntity<DepositView> getDeposit(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable String reference) {
        return ResponseEntity.ok(paymentService.getDeposit(userId, reference));
    }

    @PostMapping("/deposits/{reference}/verify")
    public ResponseEntity<DepositView> verifyDeposit(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable String reference) {
        return ResponseEntity.ok(paymentService.verifyDeposit(userId, reference));
    }

    @GetMapping("/history")
    public ResponseEntity<List<PaymentRecord>> history(
            @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(paymentService.history(userId));
    }

    /**
     * Service-to-service payout from the Vault Service. The gateway blocks
     * /internal/ paths, so this is unreachable from outside the network.
     */
    @PostMapping("/internal/payouts")
    public ResponseEntity<PaymentRecord> payout(@Valid @RequestBody PayoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.payout(request));
    }
}
