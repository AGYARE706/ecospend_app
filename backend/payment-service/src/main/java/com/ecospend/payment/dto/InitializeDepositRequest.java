package com.ecospend.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/** Wallet top-up request: opens a Paystack checkout for the amount. */
public record InitializeDepositRequest(
        @NotNull @Positive BigDecimal amount,
        String phone,
        /**
         * Where Paystack should redirect after checkout, computed client-side
         * (Linking.createURL). Expo Go and standalone builds resolve to
         * different URL schemes, so the server's default callback URL can't
         * be hardcoded — it must match whatever the client is actually
         * listening for, or the browser never hands control back to the app.
         */
        String redirectUrl
) {
}
