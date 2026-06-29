package com.ecospend.expense.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "transactions") // Maps to the correct V1 schema table name
@Data
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 10)
    private String type; // Handles 'INCOME' or 'EXPENSE'

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 20)
    private String provider; // e.g., MTN, TELECEL, AT_MONEY

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "momo_fee", precision = 10, scale = 2)
    private BigDecimal momoFee = BigDecimal.ZERO; // Added to match schema logic

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
        if (this.momoFee == null) {
            this.momoFee = BigDecimal.ZERO;
        }
    }
}