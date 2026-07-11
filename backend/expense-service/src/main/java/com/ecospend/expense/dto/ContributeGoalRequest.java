package com.ecospend.expense.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ContributeGoalRequest(
        @NotNull @Positive BigDecimal amount
) {}
