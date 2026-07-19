package com.ecospend.expense.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Data
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Aligned to UUID to capture identity-service users mapped through the API Gateway
    @Column(name = "user_id", nullable = false)
    private UUID userId; 

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "momo_fee", precision = 10, scale = 2)
    private BigDecimal momoFee;

    @Column(nullable = false, length = 10)
    private String type; // INCOME, EXPENSE

    @Column(length = 20)
    private String provider; // MTN, TELECEL

    @Column(length = 50)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }
}