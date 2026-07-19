package com.ecospend.engagement.dto;

import java.util.List;

public record LessonCompletionResponse(int xpEarned, List<BadgeView> newlyUnlockedBadges) {
}
