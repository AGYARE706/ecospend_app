package com.ecospend.vault.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record AmountRequest(
        @NotNull @Positive BigDecimal amount,
        String note
) {
}
