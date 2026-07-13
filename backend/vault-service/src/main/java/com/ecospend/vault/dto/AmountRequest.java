package com.ecospend.vault.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record AmountRequest(
        @NotNull @Positive BigDecimal amount,
        String note,
        String momoNumber,
        String momoProvider
) {
    public AmountRequest(BigDecimal amount, String note) {
        this(amount, note, null, null);
    }

    public boolean hasPayoutDestination() {
        return momoNumber != null && !momoNumber.isBlank();
    }
}
