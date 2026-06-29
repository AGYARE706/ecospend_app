package com.ecospend.expense.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "budget_envelopes", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "category", "month", "year" })
})
@Data
public class BudgetEnvelope {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String category;

    // Aligned to match 'monthly_limit' in the SQL file
    @Column(name = "monthly_limit", nullable = false, precision = 15, scale = 2)
    private BigDecimal budgetLimit;

    // Aligned to match 'current_spend' in the SQL file
    @Column(name = "current_spend", nullable = false, precision = 15, scale = 2)
    private BigDecimal currentSpent = BigDecimal.ZERO;

    // Missing field additions required by database layer
    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
        if (this.currentSpent == null) {
            this.currentSpent = BigDecimal.ZERO;
        }
    }
}