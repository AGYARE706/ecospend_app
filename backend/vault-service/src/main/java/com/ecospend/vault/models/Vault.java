package com.ecospend.vault.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Entity
@Table(name = "vaults", schema = "vault_schema")
@Data
public class Vault {

    public enum Status { ACTIVE, BROKEN, CLOSED }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "target_amount", precision = 15, scale = 2)
    private BigDecimal targetAmount;

    @Column(name = "locked_until", nullable = false)
    private LocalDate lockedUntil;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    private Status status = Status.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }

    // Fee amounts in GHS and days to maturity are always included in
    // API responses so charges are visible before any withdrawal.

    @JsonProperty("daysToMaturity")
    public long getDaysToMaturity() {
        return Math.max(0, ChronoUnit.DAYS.between(LocalDate.now(), lockedUntil));
    }

    @JsonProperty("withdrawalFeeGhs")
    public BigDecimal getWithdrawalFeeGhs() {
        return Fees.feeOn(balance, Fees.WITHDRAWAL_FEE_RATE);
    }

    @JsonProperty("earlyExitFeeGhs")
    public BigDecimal getEarlyExitFeeGhs() {
        return Fees.feeOn(balance, Fees.EARLY_EXIT_FEE_RATE);
    }
}
