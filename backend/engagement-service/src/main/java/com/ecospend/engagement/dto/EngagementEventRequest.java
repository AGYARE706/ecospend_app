package com.ecospend.engagement.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Map;
import java.util.UUID;

public record EngagementEventRequest(@NotNull UUID userId, @NotNull String type, Map<String, Object> metadata) {
}
