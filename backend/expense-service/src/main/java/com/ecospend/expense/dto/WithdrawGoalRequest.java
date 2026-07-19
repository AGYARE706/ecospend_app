package com.ecospend.expense.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record WithdrawGoalRequest(
        @NotNull @Positive BigDecimal amount
) {
}
