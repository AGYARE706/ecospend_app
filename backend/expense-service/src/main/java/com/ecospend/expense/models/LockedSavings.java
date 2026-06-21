package com.ecospend.expense.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "locked_savings")
@Data
public class LockedSavings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Long userId;
    private String targetName;
    private BigDecimal targetAmount;
    private BigDecimal currentBalance;
    private OffsetDateTime lockUntilDate;
    private boolean isMatured;
    private OffsetDateTime createdAt;
}