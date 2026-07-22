package com.ecospend.identity.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Represents a registered EcoSpend user.
 * Authentication is phone + password (BCrypt) to match the mobile app.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "phone_number", unique = true, nullable = false, length = 15)
    private String phoneNumber;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(length = 100)
    private String email;

    @Column(name = "subscription_tier", nullable = false, length = 20)
    @Builder.Default
    private String subscriptionTier = "FREE";

    /** "MONTHLY" or "YEARLY" — null while on FREE. */
    @Column(name = "subscription_plan", length = 20)
    private String subscriptionPlan;

    /** When the current Plus period ends. Null while on FREE. */
    @Column(name = "subscription_expires_at")
    private LocalDateTime subscriptionExpiresAt;

    /** Whether the subscription re-charges the wallet at expiry instead of lapsing to FREE. */
    @Column(name = "auto_renew", nullable = false)
    @Builder.Default
    private boolean autoRenew = true;

    @Column(name = "push_token")
    private String pushToken;

    /** Data URI (base64), set via PUT /users/me/photo. Null until uploaded. */
    @Column(name = "profile_photo", columnDefinition = "TEXT")
    private String profilePhoto;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "phone_verified", nullable = false)
    @Builder.Default
    private boolean phoneVerified = false;

    @Column(name = "two_factor_enabled", nullable = false)
    @Builder.Default
    private boolean twoFactorEnabled = false;

    @Column(name = "failed_login_attempts", nullable = false)
    @Builder.Default
    private int failedLoginAttempts = 0;

    /** Set once failedLoginAttempts hits the threshold; cleared on next successful login. */
    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    /** Whether the compulsory first-login setup wizard (income target + budgets) has been completed. */
    @Column(name = "setup_completed", nullable = false)
    @Builder.Default
    private boolean setupCompleted = false;

    /** MTN/TELECEL/AT — the provider for phoneNumber, used for "send to myself" MoMo transfers. Null until first chosen. */
    @Column(name = "momo_provider", length = 20)
    private String momoProvider;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
