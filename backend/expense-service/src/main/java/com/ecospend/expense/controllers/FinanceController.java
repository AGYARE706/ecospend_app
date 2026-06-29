package com.ecospend.expense.controllers;

import com.ecospend.expense.models.Transaction;
import com.ecospend.expense.models.SavingsGoal;
import com.ecospend.expense.models.BudgetEnvelope;
import com.ecospend.expense.repository.TransactionRepository;
import com.ecospend.expense.repository.SavingsGoalRepository;
import com.ecospend.expense.repository.BudgetEnvelopeRepository;
import com.ecospend.expense.services.MomoFeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/finance") // Aligned with context-path requirements
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

    // 1. MoMo Fee Utility API
    @GetMapping("/momo-fee")
    public ResponseEntity<BigDecimal> getMomoFee(
            @RequestParam BigDecimal amount,
            @RequestParam String provider) {
        return ResponseEntity.ok(momoFeeService.calculateFee(amount, provider));
    }

    // 2. Transaction APIs
    @PostMapping("/transactions")
    public ResponseEntity<Transaction> createTransaction(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody Transaction transaction) {
        transaction.setUserId(userId);
        
        BigDecimal fee = momoFeeService.calculateFee(transaction.getAmount(), transaction.getProvider());
        transaction.setMomoFee(fee);
        
        return ResponseEntity.ok(transactionRepository.save(transaction));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(transactionRepository.findByUserId(userId));
    }

    // 3. Savings Goals CRUD APIs
    @PostMapping("/goals")
    public ResponseEntity<SavingsGoal> createGoal(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody SavingsGoal goal) {
        goal.setUserId(userId);
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
        return savingsGoalRepository.findById(id)
                .filter(goal -> goal.getUserId().equals(userId))
                .map(goal -> {
                    goal.setTargetName(details.getTargetName());
                    goal.setTargetAmount(details.getTargetAmount());
                    goal.setCurrentBalance(details.getCurrentBalance());
                    return ResponseEntity.ok(savingsGoalRepository.save(goal));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/goals/{id}")
    public ResponseEntity<Void> deleteGoal(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        return savingsGoalRepository.findById(id)
                .filter(goal -> goal.getUserId().equals(userId))
                .map(goal -> {
                    savingsGoalRepository.delete(goal);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. Budget Envelope CRUD APIs
    @PostMapping("/envelopes")
    public ResponseEntity<BudgetEnvelope> createEnvelope(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody BudgetEnvelope envelope) {
        envelope.setUserId(userId);
        return ResponseEntity.ok(budgetEnvelopeRepository.save(envelope));
    }

    @GetMapping("/envelopes")
    public ResponseEntity<List<BudgetEnvelope>> getEnvelopes(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(budgetEnvelopeRepository.findByUserId(userId));
    }
}