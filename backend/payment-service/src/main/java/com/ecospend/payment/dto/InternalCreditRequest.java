package com.ecospend.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Service-to-service wallet credit (e.g. vault withdrawal net payout,
 * goal withdrawal). The caller-supplied reference is the idempotency
 * key: replays return the original record without crediting twice.
 * When {@code record} is true an INCOME transaction is auto-recorded
 * in the expense service with the given category/note.
 */
public record InternalCreditRequest(
        @NotNull UUID userId,
        @NotNull @Positive BigDecimal amount,
        @NotBlank String reference,
        String category,
        String note,
        boolean record
) {
}
