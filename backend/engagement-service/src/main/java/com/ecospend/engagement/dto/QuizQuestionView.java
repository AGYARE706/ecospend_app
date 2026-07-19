package com.ecospend.engagement.dto;

import java.util.List;

public record QuizQuestionView(Long id, String question, List<String> choices, int correctIndex, String explanation) {
}
