package com.ecospend.engagement.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CompleteLessonRequest(@NotNull @Min(0) @Max(100) Integer quizScore) {
}
