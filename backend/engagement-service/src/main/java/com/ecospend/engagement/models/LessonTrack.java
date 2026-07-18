package com.ecospend.engagement.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "lesson_tracks", schema = "engagement_schema")
@Data
public class LessonTrack {

    @Id
    private String id;

    private String title;

    private String description;

    private String icon;

    @Column(name = "sort_order")
    private int sortOrder;
}
