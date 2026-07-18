package com.ecospend.engagement.dto;

import java.util.List;

public record LessonDetailView(
        String id,
        String trackId,
        String title,
        String summary,
        String content,
        int xpReward,
        boolean completed,
        List<QuizQuestionView> quiz
) {
}
