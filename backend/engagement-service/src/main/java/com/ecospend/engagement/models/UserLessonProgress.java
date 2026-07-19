package com.ecospend.engagement.models;

import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_lesson_progress", schema = "engagement_schema")
@Data
@IdClass(UserLessonProgress.Key.class)
public class UserLessonProgress {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "lesson_id")
    private String lessonId;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "quiz_score")
    private int quizScore;

    @PrePersist
    protected void onCreate() {
        this.completedAt = OffsetDateTime.now();
    }

    @Data
    public static class Key implements Serializable {
        private UUID userId;
        private String lessonId;
    }
}
