package com.ecospend.expense.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

/** Zero clears the target (income tracking hidden until set again). */
public record IncomeTargetRequest(
        @NotNull @PositiveOrZero BigDecimal monthlyAmount
) {
}
