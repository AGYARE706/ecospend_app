package com.ecospend.notification.dto;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Client-facing shape of a notification. The stored `data` JSON string is
 * deserialized back into a map so the app receives structured deep-link info.
 */
public record NotificationResponse(
        UUID id,
        String title,
        String body,
        String type,
        Map<String, Object> data,
        boolean read,
        LocalDateTime createdAt
) {}
