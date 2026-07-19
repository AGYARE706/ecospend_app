package com.ecospend.vault.services;

import com.ecospend.vault.client.EngagementClient;
import com.ecospend.vault.client.NotificationClient;
import com.ecospend.vault.client.PaymentClient;
import com.ecospend.vault.config.VaultTierPolicy;
import com.ecospend.vault.dto.AmountRequest;
import com.ecospend.vault.dto.CreateVaultRequest;
import com.ecospend.vault.exceptions.VaultException;
import com.ecospend.vault.models.Fees;
import com.ecospend.vault.models.Vault;
import com.ecospend.vault.models.VaultTransaction;
import com.ecospend.vault.repository.VaultRepository;
import com.ecospend.vault.repository.VaultTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VaultService {

    private final VaultRepository vaultRepository;
    private final VaultTransactionRepository transactionRepository;
    private final VaultTierPolicy vaultTierPolicy;
    private final PaymentClient paymentClient;
    private final NotificationClient notificationClient;
    private final EngagementClient engagementClient;

    @Transactional
    public Vault create(UUID userId, String tier, CreateVaultRequest request) {
        long count = vaultRepository.countByUserId(userId);
        vaultTierPolicy.assertCanCreatePersonalVault(tier, count);

        Vault vault = new Vault();
        vault.setUserId(userId);
        vault.setName(request.name());
        vault.setTargetAmount(request.targetAmount());
        vault.setLockedUntil(request.lockedUntil());
        Vault saved = vaultRepository.save(vault);

        engagementClient.fire(userId, "VAULT_CREATED", Map.of("vaultId", saved.getId().toString()));
        return saved;
    }

    public List<Vault> findAll(UUID userId) {
        return vaultRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Vault findOne(UUID userId, UUID vaultId) {
        return vaultRepository.findByIdAndUserId(vaultId, userId)
                .orElseThrow(VaultException::notFound);
    }

    public List<VaultTransaction> findTransactions(UUID userId, UUID vaultId) {
        findOne(userId, vaultId);
        return transactionRepository.findByVaultIdAndUserIdOrderByCreatedAtDesc(vaultId, userId);
    }

    @Transactional
    public Vault deposit(UUID userId, UUID vaultId, AmountRequest request) {
        Vault vault = findOne(userId, vaultId);
        requireActive(vault);

        if (vault.getTargetAmount() != null) {
            BigDecimal remaining = vault.getTargetAmount().subtract(vault.getBalance());
            if (request.amount().compareTo(remaining) > 0) {
                throw VaultException.badRequest(remaining.signum() <= 0
                        ? "This vault has already reached its target and no longer accepts deposits. Withdraw once matured, or create a new vault."
                        : "That's more than this vault needs — enter GHS " + remaining + " or less to stay within the target.");
            }
        }

        vault.setBalance(vault.getBalance().add(request.amount()));
        record(vault, VaultTransaction.Type.DEPOSIT, request.amount(), request.note());
        Vault saved = vaultRepository.save(vault);

        // The guard above means a deposit can never overshoot the target, so
        // reaching it here is always a fresh crossing — no before/after diff needed.
        if (hasReachedTarget(saved)) {
            notificationClient.send(userId, "Target reached",
                    String.format("\"%s\" has hit its target of GHS %.2f — it stays locked until %s.",
                            saved.getName(), saved.getTargetAmount(), saved.getLockedUntil()),
                    "VAULT_TARGET_REACHED", Map.of("vaultId", saved.getId().toString()));
        }
        return saved;
    }

    /** Never true for a vault with no target set — over-saving toward "nothing" isn't a completion. */
    private boolean hasReachedTarget(Vault vault) {
        return vault.getTargetAmount() != null
                && vault.getBalance().compareTo(vault.getTargetAmount()) >= 0;
    }

    @Transactional
    public Vault withdraw(UUID userId, UUID vaultId, AmountRequest request) {
        Vault vault = findOne(userId, vaultId);
        requireActive(vault);

        if (LocalDate.now().isBefore(vault.getLockedUntil())) {
            throw VaultException.conflict(
                    "Vault is locked until " + vault.getLockedUntil() + ". Use break to withdraw early with a penalty.");
        }
        if (vault.getBalance().compareTo(request.amount()) < 0) {
            throw VaultException.badRequest("Insufficient vault balance");
        }

        // On time, but never actually hit the target: the date was kept, the commitment wasn't.
        boolean shortfall = !hasReachedTarget(vault);
        BigDecimal rate = shortfall ? Fees.SHORTFALL_FEE_RATE : Fees.WITHDRAWAL_FEE_RATE;
        BigDecimal fee = Fees.feeOn(request.amount(), rate);
        BigDecimal payout = request.amount().subtract(fee);

        vault.setBalance(vault.getBalance().subtract(request.amount()));
        record(vault, VaultTransaction.Type.FEE, fee,
                shortfall ? "Below-target maturity fee (4%)" : "Platform sustainability fee (2%)");
        record(vault, VaultTransaction.Type.WITHDRAWAL, payout,
                request.note() != null ? request.note() : "Withdrawal payout");
        Vault saved = vaultRepository.save(vault);

        // Net payout lands in the central wallet; a failed credit rolls
        // the whole withdrawal back.
        paymentClient.creditWallet(userId, payout, "ecospend-vw-" + UUID.randomUUID(),
                "Vault withdrawal — " + vault.getName() + " (net of 2% fee)");

        notificationClient.send(userId, "Vault matured",
                String.format("\"%s\" has matured — GHS %.2f was withdrawn to your wallet.",
                        vault.getName(), payout),
                "VAULT_MATURED", Map.of("vaultId", vault.getId().toString()));
        engagementClient.fire(userId, "VAULT_MATURED", Map.of("vaultId", vault.getId().toString()));

        return saved;
    }

    @Transactional
    public Vault breakVault(UUID userId, UUID vaultId) {
        Vault vault = findOne(userId, vaultId);
        requireActive(vault);

        if (!LocalDate.now().isBefore(vault.getLockedUntil())) {
            throw VaultException.conflict("Vault is already unlocked; use a normal withdrawal");
        }
        if (vault.getBalance().compareTo(BigDecimal.ZERO) == 0) {
            throw VaultException.badRequest("Vault balance is zero; nothing to break");
        }

        BigDecimal penalty = Fees.feeOn(vault.getBalance(), Fees.EARLY_EXIT_FEE_RATE);
        BigDecimal payout = vault.getBalance().subtract(penalty);

        record(vault, VaultTransaction.Type.PENALTY, penalty, "Early break penalty (5%)");
        record(vault, VaultTransaction.Type.WITHDRAWAL, payout, "Early break payout");

        vault.setBalance(BigDecimal.ZERO);
        vault.setStatus(Vault.Status.BROKEN);
        Vault saved = vaultRepository.save(vault);

        paymentClient.creditWallet(userId, payout, "ecospend-vb-" + UUID.randomUUID(),
                "Vault break — " + vault.getName() + " (net of 5% penalty)");
        return saved;
    }

    @Transactional
    public void delete(UUID userId, UUID vaultId) {
        Vault vault = findOne(userId, vaultId);
        if (vault.getBalance().compareTo(BigDecimal.ZERO) > 0) {
            throw VaultException.conflict("Vault still holds funds; withdraw or break it first");
        }
        vaultRepository.delete(vault);
    }

    private void requireActive(Vault vault) {
        if (vault.getStatus() != Vault.Status.ACTIVE) {
            throw VaultException.conflict("Vault is " + vault.getStatus() + " and no longer accepts operations");
        }
    }

    private void record(Vault vault, VaultTransaction.Type type, BigDecimal amount, String note) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }
        VaultTransaction tx = new VaultTransaction();
        tx.setVaultId(vault.getId());
        tx.setUserId(vault.getUserId());
        tx.setType(type);
        tx.setAmount(amount);
        tx.setNote(note);
        transactionRepository.save(tx);
    }
}
