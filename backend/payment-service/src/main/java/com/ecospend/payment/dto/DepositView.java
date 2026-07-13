package com.ecospend.payment.dto;

import com.ecospend.payment.models.PaymentRecord;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record DepositView(
        String reference,
        UUID vaultId,
        BigDecimal amount,
        String status,
        String authorizationUrl,
        LocalDateTime createdAt
) {
    public static DepositView of(PaymentRecord record, String authorizationUrl) {
        return new DepositView(
                record.getReference(),
                record.getVaultId(),
                record.getAmountGhs(),
                record.getStatus().name(),
                authorizationUrl,
                record.getCreatedAt());
    }
}
