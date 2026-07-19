package com.ecospend.expense.services;

import com.ecospend.expense.dto.TransactionSummaryResponse;
import com.ecospend.expense.models.Transaction;

import java.math.BigDecimal;
import java.util.List;

/**
 * Pure aggregation helpers over an already-loaded transaction list.
 * Shared by {@code FinanceController}'s summary endpoint and the AI
 * coach's tools, so both surfaces report identical numbers.
 */
public final class FinanceAggregations {

    private FinanceAggregations() {
    }

    public static TransactionSummaryResponse summarize(List<Transaction> transactions, int month, int year) {
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

        return new TransactionSummaryResponse(income, expense, income.subtract(expense), count);
    }
}
