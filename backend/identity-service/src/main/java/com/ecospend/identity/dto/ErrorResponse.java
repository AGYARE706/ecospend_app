package com.ecospend.identity.dto;

import java.time.Instant;

/**
 * Standard error shape returned by the GlobalExceptionHandler.
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