package com.ecospend.engagement.models;

import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_achievements", schema = "engagement_schema")
@Data
@IdClass(UserAchievement.Key.class)
public class UserAchievement {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "achievement_id")
    private String achievementId;

    private int progress;

    @Column(name = "unlocked_at")
    private OffsetDateTime unlockedAt;

    @Data
    public static class Key implements Serializable {
        private UUID userId;
        private String achievementId;
    }
}
