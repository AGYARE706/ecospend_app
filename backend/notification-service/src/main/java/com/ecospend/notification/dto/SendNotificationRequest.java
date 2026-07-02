package com.ecospend.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;
import java.util.UUID;

/**
 * Payload for POST /notifications/send. Called service-to-service by other
 * backend modules (e.g. expense-service on a large spend, a future
 * vault-service on maturity) to notify a user.
 */
public record SendNotificationRequest(

        @NotNull(message = "userId is required")
        UUID userId,

        @NotBlank(message = "title is required")
        String title,

        @NotBlank(message = "body is required")
        String body,

        /** Category, e.g. TRANSACTION | VAULT | GROUP_VAULT | REMINDER | SYSTEM. Defaults to SYSTEM. */
        String type,

        /** Optional deep-link payload delivered with the push and stored on the inbox row. */
        Map<String, Object> data
) {}
