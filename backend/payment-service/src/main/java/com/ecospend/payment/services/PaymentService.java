package com.ecospend.payment.services;

import com.ecospend.payment.client.PaystackClient;
import com.ecospend.payment.client.VaultClient;
import com.ecospend.payment.dto.DepositView;
import com.ecospend.payment.dto.InitializeDepositRequest;
import com.ecospend.payment.dto.PayoutRequest;
import com.ecospend.payment.exceptions.PaymentException;
import com.ecospend.payment.models.PaymentRecord;
import com.ecospend.payment.repository.PaymentRecordRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRecordRepository paymentRecordRepository;
    private final PaystackClient paystackClient;
    private final VaultClient vaultClient;

    /**
     * Phase one of a deposit: record the intent and open a Paystack
     * checkout. The vault balance is NOT touched here — it is only
     * credited after Paystack confirms the charge (verify or webhook).
     */
    @Transactional
    public DepositView initializeDeposit(UUID userId, InitializeDepositRequest request) {
        String reference = "ecospend-dep-" + UUID.randomUUID();

        PaystackClient.InitializeResult init =
                paystackClient.initializeTransaction(reference, request.amount(), request.phone());

        PaymentRecord record = new PaymentRecord();
        record.setUserId(userId);
        record.setVaultId(request.vaultId());
        record.setType(PaymentRecord.Type.DEPOSIT);
        record.setAmountGhs(request.amount());
        record.setReference(reference);
        paymentRecordRepository.save(record);

        return DepositView.of(record, init.authorizationUrl());
    }

    public DepositView getDeposit(UUID userId, String reference) {
        PaymentRecord record = paymentRecordRepository
                .findByReferenceAndUserId(reference, userId)
                .orElseThrow(PaymentException::notFound);
        return DepositView.of(record, null);
    }

    public List<PaymentRecord> history(UUID userId) {
        return paymentRecordRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Phase two of a deposit, client-initiated: ask Paystack whether the
     * charge went through and credit the vault exactly once if so.
     */
    @Transactional
    public DepositView verifyDeposit(UUID userId, String reference) {
        PaymentRecord record = paymentRecordRepository
                .findByReferenceAndUserId(reference, userId)
                .orElseThrow(PaymentException::notFound);

        if (record.getStatus() == PaymentRecord.Status.PENDING) {
            PaystackClient.VerifyResult result = paystackClient.verifyTransaction(reference);
            if (result.success()) {
                settleDeposit(reference);
            }
            // Not successful yet: leave PENDING — the user may still be
            // mid-checkout, or the webhook may settle it later.
        }

        PaymentRecord fresh = paymentRecordRepository
                .findByReferenceAndUserId(reference, userId)
                .orElseThrow(PaymentException::notFound);
        return DepositView.of(fresh, null);
    }

    /**
     * Idempotent settlement: only the caller that wins the
     * PENDING → SUCCESS transition credits the vault. If the vault
     * credit fails, the transaction rolls back to PENDING so a retry
     * (webhook redelivery or another verify) can settle it later.
     */
    @Transactional
    public void settleDeposit(String reference) {
        int claimed = paymentRecordRepository.markSuccessIfPending(reference);
        if (claimed == 0) {
            log.info("Deposit {} already settled — skipping", reference);
            return;
        }

        PaymentRecord record = paymentRecordRepository.findByReference(reference)
                .orElseThrow(PaymentException::notFound);
        vaultClient.creditVault(
                record.getUserId(), record.getVaultId(), record.getAmountGhs(), reference);
    }

    @Transactional
    public void failDeposit(String reference, String reason) {
        paymentRecordRepository.markFailedIfPending(reference, reason);
    }

    /**
     * Payout leg, called service-to-service by the Vault Service after it
     * has debited the vault and deducted the platform fee. Initiates a
     * Paystack transfer of the net amount to the user's MoMo wallet.
     */
    @Transactional
    public PaymentRecord payout(PayoutRequest request) {
        String reference = "ecospend-pay-" + UUID.randomUUID();

        PaymentRecord record = new PaymentRecord();
        record.setUserId(request.userId());
        record.setVaultId(request.vaultId());
        record.setType(PaymentRecord.Type.PAYOUT);
        record.setAmountGhs(request.amount());
        record.setReference(reference);
        record.setMomoNumber(request.momoNumber());
        record.setMomoProvider(request.momoProvider());
        paymentRecordRepository.save(record);

        PaystackClient.TransferResult result = paystackClient.transferToMomo(
                reference,
                request.amount(),
                request.momoNumber(),
                request.momoProvider(),
                request.recipientName() != null ? request.recipientName() : "EcoSpend user",
                request.reason() != null ? request.reason() : "EcoSpend vault payout");

        record.setTransferCode(result.transferCode());
        if (result.success()) {
            record.setStatus(PaymentRecord.Status.SUCCESS);
        }
        return paymentRecordRepository.save(record);
    }

    @Transactional
    public void completeTransfer(String reference, boolean success, String message) {
        if (success) {
            paymentRecordRepository.markSuccessIfPending(reference);
        } else {
            paymentRecordRepository.markFailedIfPending(reference, message);
        }
    }
}
