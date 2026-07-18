package com.ecospend.engagement.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "lessons", schema = "engagement_schema")
@Data
public class Lesson {

    @Id
    private String id;

    @Column(name = "track_id")
    private String trackId;

    private String title;

    private String summary;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "sort_order")
    private int sortOrder;

    @Column(name = "xp_reward")
    private int xpReward;
}
