package com.ecospend.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Service-to-service payout instruction from the Vault Service: transfer
 * the net (post-fee) amount to the user's MoMo wallet.
 */
public record PayoutRequest(
        @NotNull UUID userId,
        UUID vaultId,
        @NotNull @Positive BigDecimal amount,
        @NotBlank String momoNumber,
        @NotBlank String momoProvider,
        String recipientName,
        String reason
) {
}
