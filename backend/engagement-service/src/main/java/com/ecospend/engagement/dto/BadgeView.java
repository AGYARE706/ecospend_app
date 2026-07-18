package com.ecospend.engagement.dto;

import java.time.OffsetDateTime;

public record BadgeView(
        String id,
        String title,
        String description,
        String icon,
        String category,
        int target,
        int current,
        boolean unlocked,
        OffsetDateTime unlockedAt
) {
}
