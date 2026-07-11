package com.ecospend.expense.controllers;

import com.ecospend.expense.dto.ContributeGoalRequest;
import com.ecospend.expense.dto.TransactionSummaryResponse;
import com.ecospend.expense.dto.UpdateEnvelopeRequest;
import com.ecospend.expense.exception.BadRequestException;
import com.ecospend.expense.exception.ResourceNotFoundException;
import com.ecospend.expense.models.BudgetEnvelope;
import com.ecospend.expense.models.SavingsGoal;
import com.ecospend.expense.models.Transaction;
import com.ecospend.expense.repository.BudgetEnvelopeRepository;
import com.ecospend.expense.repository.SavingsGoalRepository;
import com.ecospend.expense.repository.TransactionRepository;
import com.ecospend.expense.services.MomoFeeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
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
    private final MomoFeeService momoFeeService;

    public FinanceController(TransactionRepository transactionRepository,
            SavingsGoalRepository savingsGoalRepository,
            BudgetEnvelopeRepository budgetEnvelopeRepository,
            MomoFeeService momoFeeService) {
        this.transactionRepository = transactionRepository;
        this.savingsGoalRepository = savingsGoalRepository;
        this.budgetEnvelopeRepository = budgetEnvelopeRepository;
        this.momoFeeService = momoFeeService;
    }

    @GetMapping("/momo-fee")
    public ResponseEntity<BigDecimal> getMomoFee(
            @RequestParam BigDecimal amount,
            @RequestParam String provider) {
        return ResponseEntity.ok(momoFeeService.calculateFee(amount, provider));
    }

    @PostMapping("/transactions")
    public ResponseEntity<Transaction> createTransaction(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody Transaction transaction) {
        transaction.setId(null);
        transaction.setUserId(userId);

        if (transaction.getProvider() != null && !transaction.getProvider().isBlank()) {
            BigDecimal fee = momoFeeService.calculateFee(transaction.getAmount(), transaction.getProvider());
            transaction.setMomoFee(fee);
        } else {
            transaction.setMomoFee(BigDecimal.ZERO);
        }

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
            tx.setMomoFee(BigDecimal.ZERO);
        } else if (details.getProvider() != null) {
            tx.setProvider(details.getProvider());
            tx.setMomoFee(momoFeeService.calculateFee(tx.getAmount(), tx.getProvider()));
        }

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

    @PostMapping("/goals/{id}/contribute")
    public ResponseEntity<SavingsGoal> contributeToGoal(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody ContributeGoalRequest request) {
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        BigDecimal next = goal.getCurrentAmount().add(request.amount());
        if (next.compareTo(goal.getTargetAmount()) > 0) {
            next = goal.getTargetAmount();
        }
        goal.setCurrentAmount(next);
        markCompletedIfNeeded(goal);
        return ResponseEntity.ok(savingsGoalRepository.save(goal));
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
