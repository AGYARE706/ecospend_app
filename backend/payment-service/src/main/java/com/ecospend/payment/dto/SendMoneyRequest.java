package com.ecospend.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/**
 * Wallet money-out: transfer the amount from the caller's wallet to an
 * external MoMo number via Paystack. The spending category (Food, Rent,
 * Fees, ...) is carried onto the auto-recorded expense so budget
 * analysis on the dashboard reflects what the money was spent on.
 */
public record SendMoneyRequest(
        @NotNull @Positive BigDecimal amount,
        @NotBlank String momoNumber,
        @NotBlank String momoProvider,
        String recipientName,
        String category
) {
}
