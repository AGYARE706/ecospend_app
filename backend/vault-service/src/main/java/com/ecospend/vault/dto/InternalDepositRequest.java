package com.ecospend.vault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Service-to-service credit from the Payment Service after a Paystack
 * deposit has been verified. Never reachable through the gateway.
 */
public record InternalDepositRequest(
        @NotNull UUID userId,
        @NotNull UUID vaultId,
        @NotNull @Positive BigDecimal amount,
        @NotBlank String reference
) {}
