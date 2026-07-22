package com.ecospend.payment.controllers;

import com.ecospend.payment.dto.GroupTransferRequest;
import com.ecospend.payment.dto.InternalCreditRequest;
import com.ecospend.payment.dto.InternalDebitRequest;
import com.ecospend.payment.dto.SendMoneyRequest;
import com.ecospend.payment.dto.VaultTransferRequest;
import com.ecospend.payment.dto.WalletView;
import com.ecospend.payment.models.PaymentRecord;
import com.ecospend.payment.services.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * The wallet surface: balance, money-out to MoMo, and internal transfers
 * into vaults and group vaults. The /internal/ endpoints are for
 * service-to-service calls only — the gateway 403s every /internal/ path.
 */
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class WalletController {

    private final PaymentService paymentService;

    @GetMapping("/wallet")
    public ResponseEntity<WalletView> wallet(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(new WalletView(paymentService.walletBalance(userId)));
    }

    /** Send money from the wallet to an external MoMo number. */
    @PostMapping("/withdrawals")
    public ResponseEntity<PaymentRecord> sendMoney(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody SendMoneyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.sendMoney(userId, request));
    }

    /** Current status of a payout — polled while a transfer is still PENDING confirmation. */
    @GetMapping("/withdrawals/{reference}")
    public ResponseEntity<PaymentRecord> getPayout(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable String reference) {
        return ResponseEntity.ok(paymentService.getPayout(userId, reference));
    }

    @PostMapping("/transfers/vault")
    public ResponseEntity<PaymentRecord> transferToVault(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody VaultTransferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.transferToVault(userId, request));
    }

    @PostMapping("/transfers/group")
    public ResponseEntity<PaymentRecord> transferToGroup(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody GroupTransferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.transferToGroup(userId, request));
    }

    // ---- service-to-service (unreachable through the gateway) ----

    @PostMapping("/internal/credits")
    public ResponseEntity<PaymentRecord> internalCredit(
            @Valid @RequestBody InternalCreditRequest request) {
        return ResponseEntity.ok(paymentService.internalCredit(request));
    }

    @PostMapping("/internal/debits")
    public ResponseEntity<PaymentRecord> internalDebit(
            @Valid @RequestBody InternalDebitRequest request) {
        return ResponseEntity.ok(paymentService.internalDebit(request));
    }
}
