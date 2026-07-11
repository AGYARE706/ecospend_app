package com.ecospend.expense.dto;

import java.math.BigDecimal;

/**
 * Monthly transaction summary aligned with mobile MonthlySummary.
 */
public record TransactionSummaryResponse(
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal netBalance,
        long transactionCount
) {}
