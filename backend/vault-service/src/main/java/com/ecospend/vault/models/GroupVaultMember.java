package com.ecospend.vault.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "group_vault_members", schema = "vault_schema")
@Data
public class GroupVaultMember {

    public enum Status { ACTIVE, EXITED }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "group_id", nullable = false)
    private UUID groupId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    private Status status = Status.ACTIVE;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private OffsetDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        this.joinedAt = OffsetDateTime.now();
    }

    // Fees are computed on the member's OWN balance only; other
    // members' funds are never touched.

    @JsonProperty("withdrawalFeeGhs")
    public BigDecimal getWithdrawalFeeGhs() {
        return Fees.feeOn(balance, Fees.WITHDRAWAL_FEE_RATE);
    }

    @JsonProperty("earlyExitFeeGhs")
    public BigDecimal getEarlyExitFeeGhs() {
        return Fees.feeOn(balance, Fees.EARLY_EXIT_FEE_RATE);
    }
}
