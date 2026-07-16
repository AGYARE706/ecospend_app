package com.ecospend.payment.services;

import com.ecospend.payment.client.ExpenseClient;
import com.ecospend.payment.client.NotificationClient;
import com.ecospend.payment.client.PaystackClient;
import com.ecospend.payment.client.VaultClient;
import com.ecospend.payment.dto.DepositView;
import com.ecospend.payment.dto.GroupTransferRequest;
import com.ecospend.payment.dto.InitializeDepositRequest;
import com.ecospend.payment.dto.InternalCreditRequest;
import com.ecospend.payment.dto.InternalDebitRequest;
import com.ecospend.payment.dto.SendMoneyRequest;
import com.ecospend.payment.dto.VaultTransferRequest;
import com.ecospend.payment.exceptions.PaymentException;
import com.ecospend.payment.models.PaymentRecord;
import com.ecospend.payment.repository.PaymentRecordRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRecordRepository paymentRecordRepository;
    private final PaystackClient paystackClient;
    private final VaultClient vaultClient;
    private final WalletService walletService;
    private final ExpenseClient expenseClient;
    private final NotificationClient notificationClient;

    // ------------------------------------------------------------------
    // Wallet top-up (money IN via Paystack checkout)
    // ------------------------------------------------------------------

    /**
     * Phase one of a top-up: record the intent and open a Paystack
     * checkout. The wallet is NOT touched here — it is only credited
     * after Paystack confirms the charge (verify or webhook).
     */
    @Transactional
    public DepositView initializeDeposit(UUID userId, InitializeDepositRequest request) {
        String reference = "ecospend-dep-" + UUID.randomUUID();

        PaystackClient.InitializeResult init =
                paystackClient.initializeTransaction(reference, request.amount(), request.phone());

        PaymentRecord record = new PaymentRecord();
        record.setUserId(userId);
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
     * Phase two of a top-up, client-initiated: ask Paystack whether the
     * charge went through and credit the wallet exactly once if so.
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
     * PENDING → SUCCESS transition credits the wallet, so webhook
     * retries and double verifies can never credit twice.
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
        walletService.credit(record.getUserId(), record.getAmountGhs());
        expenseClient.recordTransaction(record.getUserId(), record.getAmountGhs(),
                "INCOME", "Deposit", "Wallet top-up via Paystack");

        notificationClient.send(record.getUserId(), "Wallet top-up confirmed",
                String.format("GHS %.2f was added to your wallet via Paystack.", record.getAmountGhs()),
                "WALLET_TOPUP", Map.of("reference", reference));
    }

    @Transactional
    public void failDeposit(String reference, String reason) {
        paymentRecordRepository.markFailedIfPending(reference, reason);
    }

    // ------------------------------------------------------------------
    // Send money (money OUT: wallet → external MoMo via Paystack transfer)
    // ------------------------------------------------------------------

    /**
     * Debits the wallet and initiates a Paystack transfer to the given
     * MoMo number. Runs in one transaction: if the transfer cannot be
     * initiated, the debit rolls back. A transfer that fails later
     * (webhook transfer.failed) is refunded in {@link #completeTransfer}.
     */
    @Transactional
    public PaymentRecord sendMoney(UUID userId, SendMoneyRequest request) {
        String reference = "ecospend-pay-" + UUID.randomUUID();

        walletService.debit(userId, request.amount());

        PaymentRecord record = new PaymentRecord();
        record.setUserId(userId);
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
                "EcoSpend wallet transfer");

        record.setTransferCode(result.transferCode());
        if (result.success()) {
            record.setStatus(PaymentRecord.Status.SUCCESS);
        }
        paymentRecordRepository.save(record);

        String category = request.category() == null || request.category().isBlank()
                ? "Other"
                : request.category();
        expenseClient.recordTransaction(userId, request.amount(), "EXPENSE", category,
                "Sent to " + request.momoNumber() + " (" + request.momoProvider() + ")");
        return record;
    }

    /**
     * Webhook completion for outbound transfers. A failed or reversed
     * transfer refunds the wallet exactly once (guarded by the
     * PENDING → FAILED claim).
     */
    @Transactional
    public void completeTransfer(String reference, boolean success, String message) {
        if (success) {
            paymentRecordRepository.markSuccessIfPending(reference);
            return;
        }

        int claimed = paymentRecordRepository.markFailedIfPending(reference, message);
        if (claimed == 0) {
            return;
        }
        PaymentRecord record = paymentRecordRepository.findByReference(reference)
                .orElseThrow(PaymentException::notFound);
        if (record.getType() == PaymentRecord.Type.PAYOUT) {
            walletService.credit(record.getUserId(), record.getAmountGhs());
            expenseClient.recordTransaction(record.getUserId(), record.getAmountGhs(),
                    "INCOME", "Transfer", "Refund — MoMo transfer failed");
            log.info("Refunded wallet for failed transfer {}", reference);
        }
    }

    // ------------------------------------------------------------------
    // Internal transfers (wallet → vault / group vault)
    // ------------------------------------------------------------------

    /**
     * Moves money from the wallet into a personal vault. One transaction:
     * if the vault credit fails, the wallet debit rolls back.
     */
    @Transactional
    public PaymentRecord transferToVault(UUID userId, VaultTransferRequest request) {
        String reference = "ecospend-trf-" + UUID.randomUUID();

        walletService.debit(userId, request.amount());

        PaymentRecord record = new PaymentRecord();
        record.setUserId(userId);
        record.setVaultId(request.vaultId());
        record.setType(PaymentRecord.Type.DEBIT);
        record.setAmountGhs(request.amount());
        record.setReference(reference);
        record.setStatus(PaymentRecord.Status.SUCCESS);
        paymentRecordRepository.save(record);

        vaultClient.creditVault(userId, request.vaultId(), request.amount(), reference);

        expenseClient.recordTransaction(userId, request.amount(),
                "EXPENSE", "Savings", "Vault deposit from wallet");
        return record;
    }

    /**
     * Moves money from the wallet into the caller's own balance in a
     * group vault (Digital Susu). Same rollback guarantee as vaults.
     */
    @Transactional
    public PaymentRecord transferToGroup(UUID userId, GroupTransferRequest request) {
        String reference = "ecospend-trf-" + UUID.randomUUID();

        walletService.debit(userId, request.amount());

        PaymentRecord record = new PaymentRecord();
        record.setUserId(userId);
        record.setType(PaymentRecord.Type.DEBIT);
        record.setAmountGhs(request.amount());
        record.setReference(reference);
        record.setStatus(PaymentRecord.Status.SUCCESS);
        paymentRecordRepository.save(record);

        vaultClient.creditGroup(userId, request.groupId(), request.amount(), reference);

        expenseClient.recordTransaction(userId, request.amount(),
                "EXPENSE", "Savings", "Group vault contribution from wallet");
        return record;
    }

    // ------------------------------------------------------------------
    // Service-to-service wallet moves (gateway blocks /internal/ paths)
    // ------------------------------------------------------------------

    /**
     * Credits the wallet on behalf of another service (vault payouts,
     * goal withdrawals). Idempotent on the caller-supplied reference.
     */
    @Transactional
    public PaymentRecord internalCredit(InternalCreditRequest request) {
        var existing = paymentRecordRepository.findByReference(request.reference());
        if (existing.isPresent()) {
            log.info("Internal credit {} already applied — skipping", request.reference());
            return existing.get();
        }

        PaymentRecord record = new PaymentRecord();
        record.setUserId(request.userId());
        record.setType(PaymentRecord.Type.CREDIT);
        record.setAmountGhs(request.amount());
        record.setReference(request.reference());
        record.setStatus(PaymentRecord.Status.SUCCESS);
        paymentRecordRepository.save(record);

        walletService.credit(request.userId(), request.amount());

        if (request.record()) {
            expenseClient.recordTransaction(request.userId(), request.amount(),
                    "INCOME", request.category(), request.note());
        }
        return record;
    }

    /**
     * Debits the wallet on behalf of another service (goal contributions,
     * bill payments, Plus upgrade). 400 when the balance cannot cover it;
     * idempotent on the caller-supplied reference.
     */
    @Transactional
    public PaymentRecord internalDebit(InternalDebitRequest request) {
        var existing = paymentRecordRepository.findByReference(request.reference());
        if (existing.isPresent()) {
            log.info("Internal debit {} already applied — skipping", request.reference());
            return existing.get();
        }

        walletService.debit(request.userId(), request.amount());

        PaymentRecord record = new PaymentRecord();
        record.setUserId(request.userId());
        record.setType(PaymentRecord.Type.DEBIT);
        record.setAmountGhs(request.amount());
        record.setReference(request.reference());
        record.setStatus(PaymentRecord.Status.SUCCESS);
        paymentRecordRepository.save(record);

        if (request.record()) {
            expenseClient.recordTransaction(request.userId(), request.amount(),
                    "EXPENSE", request.category(), request.note());
        }
        return record;
    }

    public BigDecimal walletBalance(UUID userId) {
        return walletService.balanceOf(userId);
    }
}
