package com.ecospend.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

/** Internal move: wallet → personal vault. */
public record VaultTransferRequest(
        @NotNull UUID vaultId,
        @NotNull @Positive BigDecimal amount
) {
}
