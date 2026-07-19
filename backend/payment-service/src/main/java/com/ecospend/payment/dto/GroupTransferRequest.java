package com.ecospend.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

/** Internal move: wallet → the caller's own balance in a group vault. */
public record GroupTransferRequest(
        @NotNull UUID groupId,
        @NotNull @Positive BigDecimal amount
) {
}
