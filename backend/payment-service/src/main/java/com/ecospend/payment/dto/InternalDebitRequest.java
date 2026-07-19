package com.ecospend.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Service-to-service wallet debit (e.g. goal contribution, bill payment,
 * Plus upgrade). Fails with 400 when the wallet cannot cover the amount.
 * The caller-supplied reference is the idempotency key. When
 * {@code record} is true an EXPENSE transaction is auto-recorded in the
 * expense service with the given category/note.
 */
public record InternalDebitRequest(
        @NotNull UUID userId,
        @NotNull @Positive BigDecimal amount,
        @NotBlank String reference,
        String category,
        String note,
        boolean record
) {
}
