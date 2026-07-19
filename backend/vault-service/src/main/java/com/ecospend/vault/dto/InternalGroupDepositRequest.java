package com.ecospend.vault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Service-to-service contribution from the Payment Service: a wallet
 * debit credited to the member's own balance in a group vault.
 * Never reachable through the gateway.
 */
public record InternalGroupDepositRequest(
        @NotNull UUID userId,
        @NotNull UUID groupId,
        @NotNull @Positive BigDecimal amount,
        @NotBlank String reference
) {}
