package com.ecospend.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record InitializeDepositRequest(
        @NotNull UUID vaultId,
        @NotNull @Positive BigDecimal amount,
        String phone
) {
}
