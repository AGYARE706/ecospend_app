package com.ecospend.engagement.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "achievements", schema = "engagement_schema")
@Data
public class Achievement {

    public enum Category { FINANCE, STREAK, LESSON }

    @Id
    private String id;

    private String title;

    private String description;

    private String icon;

    @Enumerated(EnumType.STRING)
    private Category category;

    private int target;

    @Column(name = "xp_reward")
    private int xpReward;
}
