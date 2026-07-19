package com.ecospend.expense.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * The user's expected fixed income per month. Actual income (auto-recorded
 * INCOME transactions) is compared against this every month.
 */
@Entity
@Table(name = "income_targets", schema = "expense_schema")
@Data
public class IncomeTarget {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "monthly_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal monthlyAmount;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void touch() {
        this.updatedAt = OffsetDateTime.now();
    }
}
