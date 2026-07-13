package com.ecospend.payment.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * One row per money movement attempt — a Paystack deposit (pay-in) or a
 * payout transfer to a user's MoMo wallet. The unique reference is the
 * idempotency key: webhook retries and double verifies can never credit
 * a vault twice because status only transitions PENDING → SUCCESS once.
 */
@Entity
@Table(name = "payment_records")
@Getter
@Setter
@NoArgsConstructor
public class PaymentRecord {

    public enum Type { DEPOSIT, PAYOUT }

    public enum Status { PENDING, SUCCESS, FAILED }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "vault_id")
    private UUID vaultId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Type type;

    @Column(name = "amount_ghs", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountGhs;

    @Column(nullable = false, unique = true, length = 100)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.PENDING;

    @Column(name = "momo_number", length = 20)
    private String momoNumber;

    @Column(name = "momo_provider", length = 20)
    private String momoProvider;

    @Column(name = "transfer_code", length = 100)
    private String transferCode;

    @Column(name = "failure_reason")
    private String failureReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
