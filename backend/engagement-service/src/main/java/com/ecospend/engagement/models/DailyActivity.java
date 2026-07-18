package com.ecospend.engagement.models;

import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "daily_activity", schema = "engagement_schema")
@Data
@IdClass(DailyActivity.Key.class)
public class DailyActivity {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "activity_date")
    private LocalDate activityDate;

    @Data
    public static class Key implements Serializable {
        private UUID userId;
        private LocalDate activityDate;
    }
}
