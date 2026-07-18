package com.ecospend.engagement.dto;

import java.util.List;

public record LessonTrackView(String id, String title, String description, String icon, List<LessonSummaryView> lessons) {
}
