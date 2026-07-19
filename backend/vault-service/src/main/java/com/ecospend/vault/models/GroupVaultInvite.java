package com.ecospend.vault.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "group_vault_invites", schema = "vault_schema")
@Data
public class GroupVaultInvite {

    public enum Status { PENDING, JOINED }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "group_id", nullable = false)
    private UUID groupId;

    @Column(name = "invited_by", nullable = false)
    private UUID invitedBy;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    /** Resolved at invite time if the phone already belongs to a registered user; null otherwise. */
    @Column(name = "invited_user_id")
    private UUID invitedUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    private Status status = Status.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "joined_at")
    private OffsetDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }
}
