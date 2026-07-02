package com.ecospend.notification.dto;

import java.time.Instant;

/**
 * Standard error shape, matching the identity-service envelope so the
 * frontend can reuse a single error parser across services.
 */
public record ErrorResponse(
        String code,
        String message,
        int status,
        String timestamp
) {
    public static ErrorResponse of(String code, String message, int status) {
        return new ErrorResponse(code, message, status, Instant.now().toString());
    }
}
