package com.ecospend.expense.models;

import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "coach_daily_insight", schema = "expense_schema")
@Data
@IdClass(CoachDailyInsight.Key.class)
public class CoachDailyInsight {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "insight_date")
    private LocalDate insightDate;

    @Column(nullable = false, length = 120)
    private String heading;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "generated_at", nullable = false)
    private OffsetDateTime generatedAt;

    @PrePersist
    protected void onCreate() {
        this.generatedAt = OffsetDateTime.now();
    }

    @Data
    public static class Key implements Serializable {
        private UUID userId;
        private LocalDate insightDate;
    }
}
