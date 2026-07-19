package com.ecospend.expense.models;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * A recurring bill the user tracks and pays from the wallet
 * (e.g. Netflix, DSTV). Paying advances nextDueDate by one cycle.
 */
@Entity
@Table(name = "subscriptions", schema = "expense_schema")
@Data
public class Subscription {

    public static final String CYCLE_MONTHLY = "MONTHLY";
    public static final String CYCLE_YEARLY = "YEARLY";
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_CANCELLED = "CANCELLED";

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 50)
    private String category = "Subscription";

    @Column(name = "billing_cycle", nullable = false, length = 10)
    private String billingCycle = CYCLE_MONTHLY;

    @Column(name = "next_due_date", nullable = false)
    private LocalDate nextDueDate;

    @Column(nullable = false, length = 10)
    private String status = STATUS_ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }
}
