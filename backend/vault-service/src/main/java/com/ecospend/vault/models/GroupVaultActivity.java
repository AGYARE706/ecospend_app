package com.ecospend.vault.models;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * A real event log for a group vault — every join, invite, contribution,
 * withdrawal step and exit, not just money movements. Distinct from
 * {@link GroupVaultTransaction}, which is a money-only ledger. Every
 * member can see this feed in full; it is the "who did what, when" record
 * the creator relies on to oversee the vault.
 */
@Entity
@Table(name = "group_vault_activity", schema = "vault_schema")
@Data
public class GroupVaultActivity {

    public enum Type {
        CREATED, MEMBER_INVITED, MEMBER_JOINED, CONTRIBUTION,
        WITHDRAWAL_REQUESTED, WITHDRAWAL_VOTE, WITHDRAWAL_APPROVED,
        WITHDRAWAL_REJECTED, WITHDRAWAL_EXECUTED, MEMBER_EXITED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "group_id", nullable = false)
    private UUID groupId;

    /** Null for system-generated entries (e.g. auto-rejection triggered by an exit). */
    @Column(name = "actor_user_id")
    private UUID actorUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private Type type;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "amount", precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }
}
