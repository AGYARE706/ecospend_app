package com.ecospend.expense.controllers;

import com.ecospend.expense.client.PaymentClient;
import com.ecospend.expense.dto.ContributeGoalRequest;
import com.ecospend.expense.dto.TransactionSummaryResponse;
import com.ecospend.expense.dto.UpdateEnvelopeRequest;
import com.ecospend.expense.dto.WithdrawGoalRequest;
import com.ecospend.expense.exception.BadRequestException;
import com.ecospend.expense.exception.ResourceNotFoundException;
import com.ecospend.expense.models.BudgetEnvelope;
import com.ecospend.expense.models.SavingsGoal;
import com.ecospend.expense.models.Transaction;
import com.ecospend.expense.repository.BudgetEnvelopeRepository;
import com.ecospend.expense.repository.SavingsGoalRepository;
import com.ecospend.expense.repository.TransactionRepository;
import com.ecospend.expense.services.TransactionRecorder;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/finance")
public class FinanceController {

    private final TransactionRepository transactionRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final BudgetEnvelopeRepository budgetEnvelopeRepository;
    private final TransactionRecorder transactionRecorder;
    private final PaymentClient paymentClient;

    public FinanceController(TransactionRepository transactionRepository,
            SavingsGoalRepository savingsGoalRepository,
            BudgetEnvelopeRepository budgetEnvelopeRepository,
            TransactionRecorder transactionRecorder,
            PaymentClient paymentClient) {
        this.transactionRepository = transactionRepository;
        this.savingsGoalRepository = savingsGoalRepository;
        this.budgetEnvelopeRepository = budgetEnvelopeRepository;
        this.transactionRecorder = transactionRecorder;
        this.paymentClient = paymentClient;
    }

    @PostMapping("/transactions")
    public ResponseEntity<Transaction> createTransaction(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody Transaction transaction) {
        transaction.setId(null);
        transaction.setUserId(userId);
        transaction.setMomoFee(BigDecimal.ZERO);

        return ResponseEntity.ok(transactionRepository.save(transaction));
    }

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
        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expense = BigDecimal.ZERO;
        long count = 0;

        for (Transaction tx : transactions) {
            if (tx.getCreatedAt() == null) {
                continue;
            }
            if (tx.getCreatedAt().getMonthValue() != month || tx.getCreatedAt().getYear() != year) {
                continue;
            }
            count++;
            if (tx.getType() != null && tx.getType().equalsIgnoreCase("INCOME")) {
                income = income.add(tx.getAmount());
            } else {
                expense = expense.add(tx.getAmount());
            }
        }

        return ResponseEntity.ok(new TransactionSummaryResponse(
                income,
                expense,
                income.subtract(expense),
                count
        ));
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<Transaction> getTransaction(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        Transaction tx = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        return ResponseEntity.ok(tx);
    }

    @PutMapping("/transactions/{id}")
    public ResponseEntity<Transaction> updateTransaction(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody Transaction details) {
        Transaction tx = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (details.getAmount() != null) {
            tx.setAmount(details.getAmount());
        }
        if (details.getType() != null) {
            tx.setType(details.getType());
        }
        if (details.getCategory() != null) {
            tx.setCategory(details.getCategory());
        }
        if (details.getNotes() != null) {
            tx.setNotes(details.getNotes());
        }
        if (details.getType() != null && details.getType().equalsIgnoreCase("INCOME")) {
            tx.setProvider(null);
        } else if (details.getProvider() != null) {
            tx.setProvider(details.getProvider());
        }
        tx.setMomoFee(BigDecimal.ZERO);

        return ResponseEntity.ok(transactionRepository.save(tx));
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
        if (details.getCurrentAmount() != null) {
            goal.setCurrentAmount(details.getCurrentAmount());
        }
        if (details.getDeadline() != null) {
            goal.setDeadline(details.getDeadline());
        }
        markCompletedIfNeeded(goal);
        return ResponseEntity.ok(savingsGoalRepository.save(goal));
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

        BigDecimal remaining = goal.getTargetAmount().subtract(goal.getCurrentAmount());
        if (request.amount().compareTo(remaining) > 0) {
            throw new BadRequestException(
                    "Contribution exceeds the amount remaining to reach this goal (GHS "
                            + remaining + ")");
        }

        goal.setCurrentAmount(goal.getCurrentAmount().add(request.amount()));
        markCompletedIfNeeded(goal);
        SavingsGoal saved = savingsGoalRepository.save(goal);

        transactionRecorder.record(userId, request.amount(), "EXPENSE", "Savings",
                "Goal contribution — " + goal.getName());
        paymentClient.debitWallet(userId, request.amount(),
                "ecospend-goal-" + UUID.randomUUID());

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
        envelope.setId(null);
        envelope.setUserId(userId);
        if (envelope.getCurrentSpent() == null) {
            envelope.setCurrentSpent(BigDecimal.ZERO);
        }
        return ResponseEntity.ok(budgetEnvelopeRepository.save(envelope));
    }

    @GetMapping("/envelopes")
    public ResponseEntity<List<BudgetEnvelope>> getEnvelopes(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(budgetEnvelopeRepository.findByUserId(userId));
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

    private static void markCompletedIfNeeded(SavingsGoal goal) {
        if (goal.getCurrentAmount() != null
                && goal.getTargetAmount() != null
                && goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            if (goal.getCompletedAt() == null) {
                goal.setCompletedAt(OffsetDateTime.now());
            }
        } else {
            goal.setCompletedAt(null);
        }
    }
}
