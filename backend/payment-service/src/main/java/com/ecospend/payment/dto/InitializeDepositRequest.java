package com.ecospend.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/** Wallet top-up request: opens a Paystack checkout for the amount. */
public record InitializeDepositRequest(
        @NotNull @Positive BigDecimal amount,
        String phone
) {
}
