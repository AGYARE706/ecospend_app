package com.ecospend.identity.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * One active session = one live refresh token. The raw token value is never
 * returned; {@code current} is true when the row matches the refresh token
 * the caller supplied in the X-Session-Token header.
 */
public record SessionResponse(
        UUID id,
        LocalDateTime createdAt,
        LocalDateTime expiresAt,
        boolean current
) {
}
