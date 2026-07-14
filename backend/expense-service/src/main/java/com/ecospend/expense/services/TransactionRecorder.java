package com.ecospend.expense.services;

import com.ecospend.expense.models.Transaction;
import com.ecospend.expense.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Writes the auto-recorded income/expense rows that mirror every real
 * money movement, so users never have to enter in-app payments manually.
 */
@Service
public class TransactionRecorder {

    private final TransactionRepository transactionRepository;

    public TransactionRecorder(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public Transaction record(UUID userId, BigDecimal amount, String type, String category, String notes) {
        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        transaction.setAmount(amount);
        transaction.setType(type);
        transaction.setCategory(category == null || category.isBlank() ? "Other" : category);
        transaction.setNotes(notes);
        transaction.setMomoFee(BigDecimal.ZERO);
        return transactionRepository.save(transaction);
    }
}
