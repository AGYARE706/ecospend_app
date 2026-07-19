package com.ecospend.expense.services;

import com.ecospend.expense.client.EngagementClient;
import com.ecospend.expense.client.NotificationClient;
import com.ecospend.expense.models.BudgetEnvelope;
import com.ecospend.expense.models.Transaction;
import com.ecospend.expense.repository.BudgetEnvelopeRepository;
import com.ecospend.expense.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * Writes the auto-recorded income/expense rows that mirror every real
 * money movement, so users never have to enter in-app payments manually.
 * This is the single choke point for every transaction in the app (there
 * is no manual create endpoint), so it also keeps the matching budget
 * envelope's current_spend in sync — the only place that needs to happen.
 */
@Service
public class TransactionRecorder {

    private final TransactionRepository transactionRepository;
    private final BudgetEnvelopeRepository budgetEnvelopeRepository;
    private final NotificationClient notificationClient;
    private final EngagementClient engagementClient;

    public TransactionRecorder(TransactionRepository transactionRepository,
            BudgetEnvelopeRepository budgetEnvelopeRepository,
            NotificationClient notificationClient,
            EngagementClient engagementClient) {
        this.transactionRepository = transactionRepository;
        this.budgetEnvelopeRepository = budgetEnvelopeRepository;
        this.notificationClient = notificationClient;
        this.engagementClient = engagementClient;
    }

    @Transactional
    public Transaction record(UUID userId, BigDecimal amount, String type, String category, String notes) {
        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        transaction.setAmount(amount);
        transaction.setType(type);
        transaction.setCategory(category == null || category.isBlank() ? "Other" : category);
        transaction.setNotes(notes);
        transaction.setMomoFee(BigDecimal.ZERO);
        transaction = transactionRepository.save(transaction);

        engagementClient.fire(userId, "TRANSACTION_RECORDED", Map.of("transactionId", transaction.getId().toString()));

        if ("EXPENSE".equalsIgnoreCase(transaction.getType())) {
            int month = transaction.getCreatedAt().getMonthValue();
            int year = transaction.getCreatedAt().getYear();

            BudgetEnvelope before = budgetEnvelopeRepository
                    .findByUserIdAndCategoryAndMonthAndYear(userId, transaction.getCategory(), month, year)
                    .orElse(null);
            int updated = budgetEnvelopeRepository.addSpend(userId, transaction.getCategory(), month, year, amount);

            if (updated > 0 && before != null) {
                BigDecimal previousSpent = before.getCurrentSpent();
                BigDecimal limit = before.getBudgetLimit();
                boolean justExceeded = previousSpent.compareTo(limit) < 0
                        && previousSpent.add(amount).compareTo(limit) >= 0;
                if (justExceeded) {
                    notificationClient.send(userId, "Budget limit reached",
                            String.format("You've reached your GHS %.2f \"%s\" budget for this month.",
                                    limit, transaction.getCategory()),
                            "BUDGET_ALERT", Map.of("category", transaction.getCategory()));
                }
            }
        }

        return transaction;
    }
}
