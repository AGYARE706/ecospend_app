package com.ecospend.expense.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Service-to-service auto-record request from the payment-service:
 * one row per real money movement (top-up, send, vault/group transfer).
 */
public record InternalTransactionRequest(
        @NotNull UUID userId,
        @NotNull @Positive BigDecimal amount,
        @NotBlank String type,
        String category,
        String notes
) {
}
