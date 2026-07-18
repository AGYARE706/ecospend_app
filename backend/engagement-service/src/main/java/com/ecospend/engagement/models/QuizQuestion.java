package com.ecospend.engagement.models;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "quiz_questions", schema = "engagement_schema")
@Data
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lesson_id")
    private String lessonId;

    private String question;

    /** JSON array of choice strings, e.g. ["A", "B", "C", "D"]. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String choices;

    @Column(name = "correct_index")
    private int correctIndex;

    private String explanation;

    @Column(name = "sort_order")
    private int sortOrder;
}
