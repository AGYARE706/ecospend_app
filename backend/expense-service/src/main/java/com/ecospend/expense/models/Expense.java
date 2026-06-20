package com.ecospend.expense.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "expenses")
@Data
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // <-- ADD THIS LINE
    private UUID id;

    private Long userId;
    private String type;
    private BigDecimal amount;
    private String provider;
    private String category;
    private String notes;
    private OffsetDateTime createdAt;
}