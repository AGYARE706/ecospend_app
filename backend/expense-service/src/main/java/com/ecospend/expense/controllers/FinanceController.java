package com.ecospend.expense.controllers;

import com.ecospend.expense.client.EngagementClient;
import com.ecospend.expense.client.NotificationClient;
import com.ecospend.expense.client.PaymentClient;
import com.ecospend.expense.dto.ContributeGoalRequest;
import com.ecospend.expense.dto.IncomeTargetRequest;
import com.ecospend.expense.dto.TransactionSummaryResponse;
import com.ecospend.expense.dto.UpdateEnvelopeRequest;
import com.ecospend.expense.dto.WithdrawGoalRequest;
import com.ecospend.expense.exception.BadRequestException;
import com.ecospend.expense.exception.ResourceNotFoundException;
import com.ecospend.expense.models.BudgetEnvelope;
import com.ecospend.expense.models.IncomeTarget;
import com.ecospend.expense.models.SavingsGoal;
import com.ecospend.expense.models.Transaction;
import com.ecospend.expense.repository.BudgetEnvelopeRepository;
import com.ecospend.expense.repository.IncomeTargetRepository;
import com.ecospend.expense.repository.SavingsGoalRepository;
import com.ecospend.expense.repository.TransactionRepository;
import com.ecospend.expense.services.FinanceAggregations;
import com.ecospend.expense.services.TransactionRecorder;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/finance")
public class FinanceController {

    private final TransactionRepository transactionRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final BudgetEnvelopeRepository budgetEnvelopeRepository;
    private final IncomeTargetRepository incomeTargetRepository;
    private final TransactionRecorder transactionRecorder;
    private final PaymentClient paymentClient;
    private final NotificationClient notificationClient;
    private final EngagementClient engagementClient;

    public FinanceController(TransactionRepository transactionRepository,
            SavingsGoalRepository savingsGoalRepository,
            BudgetEnvelopeRepository budgetEnvelopeRepository,
            IncomeTargetRepository incomeTargetRepository,
            TransactionRecorder transactionRecorder,
            PaymentClient paymentClient,
            NotificationClient notificationClient,
            EngagementClient engagementClient) {
        this.transactionRepository = transactionRepository;
        this.savingsGoalRepository = savingsGoalRepository;
        this.budgetEnvelopeRepository = budgetEnvelopeRepository;
        this.incomeTargetRepository = incomeTargetRepository;
        this.transactionRecorder = transactionRecorder;
        this.paymentClient = paymentClient;
        this.notificationClient = notificationClient;
        this.engagementClient = engagementClient;
    }

    // ---- Expected monthly income (the income-side counterpart of
    // budget envelopes: actual INCOME transactions are tracked against
    // this every month on the dashboard and in weekly insights) ----

    @GetMapping("/income-target")
    public ResponseEntity<IncomeTargetRequest> getIncomeTarget(
            @RequestHeader("X-User-Id") UUID userId) {
        BigDecimal amount = incomeTargetRepository.findById(userId)
                .map(IncomeTarget::getMonthlyAmount)
                .orElse(BigDecimal.ZERO);
        return ResponseEntity.ok(new IncomeTargetRequest(amount));
    }

    @PutMapping("/income-target")
    public ResponseEntity<IncomeTargetRequest> setIncomeTarget(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody IncomeTargetRequest request) {
        IncomeTarget target = incomeTargetRepository.findById(userId)
                .orElseGet(() -> {
                    IncomeTarget fresh = new IncomeTarget();
                    fresh.setUserId(userId);
                    return fresh;
                });
        target.setMonthlyAmount(request.monthlyAmount());
        incomeTargetRepository.save(target);
        return ResponseEntity.ok(new IncomeTargetRequest(target.getMonthlyAmount()));
    }

    // NOTE: there is intentionally no public create or update endpoint for
    // transactions. Records are written exclusively by the services when
    // real money moves through Paystack/the wallet (see TransactionRecorder
    // and /finance/internal/transactions), and are immutable afterwards to
    // keep spending analysis trustworthy.

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(transactionRepository.findByUserId(userId));
    }

    @GetMapping("/transactions/summary")
    public ResponseEntity<TransactionSummaryResponse> getTransactionSummary(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam int month,
            @RequestParam int year) {
        if (month < 1 || month > 12) {
            throw new BadRequestException("month must be between 1 and 12");
        }

        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        return ResponseEntity.ok(FinanceAggregations.summarize(transactions, month, year));
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<Transaction> getTransaction(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        Transaction tx = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        return ResponseEntity.ok(tx);
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        Transaction tx = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        transactionRepository.delete(tx);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/goals")
    public ResponseEntity<SavingsGoal> createGoal(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody SavingsGoal goal) {
        goal.setId(null);
        goal.setUserId(userId);
        if (goal.getCurrentAmount() == null) {
            goal.setCurrentAmount(BigDecimal.ZERO);
        }
        return ResponseEntity.ok(savingsGoalRepository.save(goal));
    }

    @GetMapping("/goals")
    public ResponseEntity<List<SavingsGoal>> getGoals(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(savingsGoalRepository.findByUserId(userId));
    }

    @PutMapping("/goals/{id}")
    public ResponseEntity<SavingsGoal> updateGoal(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody SavingsGoal details) {
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (details.getName() != null) {
            goal.setName(details.getName());
        }
        if (details.getTargetAmount() != null) {
            goal.setTargetAmount(details.getTargetAmount());
        }
        // currentAmount is deliberately not settable here: it may only move
        // through /contribute and /withdraw, which validate against the
        // wallet and record transactions. (SavingsGoal.currentAmount has a
        // ZERO field initializer, so a request body that omits it would
        // otherwise silently zero out real progress on every edit.)
        if (details.getDeadline() != null) {
            goal.setDeadline(details.getDeadline());
        }
        boolean justCompleted = markCompletedIfNeeded(goal);
        SavingsGoal saved = savingsGoalRepository.save(goal);
        if (justCompleted) {
            notifyGoalCompleted(userId, saved);
        }
        return ResponseEntity.ok(saved);
    }

    /**
     * Contributes real money from the wallet into a goal. The goal update
     * and expense record commit only if the wallet debit succeeds — the
     * debit is the last step, so a 400 (insufficient balance) rolls back.
     * Contributions may not exceed the amount remaining to the target,
     * so the wallet debit always equals the amount applied.
     */
    @PostMapping("/goals/{id}/contribute")
    @Transactional
    public ResponseEntity<SavingsGoal> contributeToGoal(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody ContributeGoalRequest request) {
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (goal.getCompletedAt() != null) {
            throw new BadRequestException(
                    "This goal is already complete and no longer accepts contributions. Withdraw or start a new goal.");
        }

        BigDecimal remaining = goal.getTargetAmount().subtract(goal.getCurrentAmount());
        if (request.amount().compareTo(remaining) > 0) {
            throw new BadRequestException(
                    "Contribution exceeds the amount remaining to reach this goal (GHS "
                            + remaining + ")");
        }

        goal.setCurrentAmount(goal.getCurrentAmount().add(request.amount()));
        boolean justCompleted = markCompletedIfNeeded(goal);
        SavingsGoal saved = savingsGoalRepository.save(goal);

        transactionRecorder.record(userId, request.amount(), "EXPENSE", "Savings",
                "Goal contribution — " + goal.getName());
        paymentClient.debitWallet(userId, request.amount(),
                "ecospend-goal-" + UUID.randomUUID());

        if (justCompleted) {
            notifyGoalCompleted(userId, saved);
        }
        return ResponseEntity.ok(saved);
    }

    /**
     * Withdraws money from a goal back into the wallet. Goals have no
     * lock or fee — the only restriction is the goal's own balance.
     */
    @PostMapping("/goals/{id}/withdraw")
    @Transactional
    public ResponseEntity<SavingsGoal> withdrawFromGoal(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody WithdrawGoalRequest request) {
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (request.amount().compareTo(goal.getCurrentAmount()) > 0) {
            throw new BadRequestException("Withdrawal exceeds the goal balance");
        }

        goal.setCurrentAmount(goal.getCurrentAmount().subtract(request.amount()));
        markCompletedIfNeeded(goal);
        SavingsGoal saved = savingsGoalRepository.save(goal);

        transactionRecorder.record(userId, request.amount(), "INCOME", "Savings",
                "Goal withdrawal — " + goal.getName());
        paymentClient.creditWallet(userId, request.amount(),
                "ecospend-goalw-" + UUID.randomUUID());

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/goals/{id}")
    public ResponseEntity<Void> deleteGoal(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        savingsGoalRepository.delete(goal);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/envelopes")
    public ResponseEntity<BudgetEnvelope> createEnvelope(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody BudgetEnvelope envelope) {
        LocalDate now = LocalDate.now();
        envelope.setId(null);
        envelope.setUserId(userId);
        envelope.setCurrentSpent(BigDecimal.ZERO);
        // Always "this month" server-side — never trust a client-supplied
        // month/year, which could be missing, stale, or spoofed.
        envelope.setMonth(now.getMonthValue());
        envelope.setYear(now.getYear());
        return ResponseEntity.ok(budgetEnvelopeRepository.save(envelope));
    }

    /** Scoped to the current month — envelopes are a monthly concept, not a running lifetime list. */
    @GetMapping("/envelopes")
    public ResponseEntity<List<BudgetEnvelope>> getEnvelopes(@RequestHeader("X-User-Id") UUID userId) {
        LocalDate now = LocalDate.now();
        return ResponseEntity.ok(budgetEnvelopeRepository
                .findByUserIdAndMonthAndYear(userId, now.getMonthValue(), now.getYear()));
    }

    @PutMapping("/envelopes/{id}")
    public ResponseEntity<BudgetEnvelope> updateEnvelope(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody UpdateEnvelopeRequest request) {
        BudgetEnvelope envelope = budgetEnvelopeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Envelope not found"));
        envelope.setBudgetLimit(request.monthlyLimit());
        return ResponseEntity.ok(budgetEnvelopeRepository.save(envelope));
    }

    /**
     * Returns true only on the null -&gt; completed transition, so callers
     * notify exactly once. Completion is permanent once reached — a later
     * withdrawal that drops the balance back below target (e.g. cashing
     * out a finished goal) must not un-complete it.
     */
    private static boolean markCompletedIfNeeded(SavingsGoal goal) {
        boolean wasCompleted = goal.getCompletedAt() != null;
        if (!wasCompleted
                && goal.getCurrentAmount() != null
                && goal.getTargetAmount() != null
                && goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setCompletedAt(OffsetDateTime.now());
        }
        return !wasCompleted && goal.getCompletedAt() != null;
    }

    private void notifyGoalCompleted(UUID userId, SavingsGoal goal) {
        notificationClient.send(userId, "Goal completed!",
                String.format("You've hit your target for \"%s\" — GHS %.2f saved.",
                        goal.getName(), goal.getTargetAmount()),
                "GOAL_COMPLETED", Map.of("goalId", goal.getId().toString()));
        engagementClient.fire(userId, "GOAL_COMPLETED", Map.of("goalId", goal.getId().toString()));
    }
}
