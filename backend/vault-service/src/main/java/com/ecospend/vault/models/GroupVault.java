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
@Table(name = "group_vaults", schema = "vault_schema")
@Data
public class GroupVault {

    public enum Status { ACTIVE, CLOSED }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "creator_id", nullable = false)
    private UUID creatorId;

    @Column(name = "target_amount", precision = 15, scale = 2)
    private BigDecimal targetAmount;

    @Column(name = "locked_until", nullable = false)
    private LocalDate lockedUntil;

    @Column(name = "max_members", nullable = false)
    private int maxMembers = 8;

    @Column(name = "invite_code", nullable = false, unique = true, length = 12)
    private String inviteCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    private Status status = Status.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }

    @JsonProperty("daysToMaturity")
    public long getDaysToMaturity() {
        return Math.max(0, ChronoUnit.DAYS.between(LocalDate.now(), lockedUntil));
    }
}
