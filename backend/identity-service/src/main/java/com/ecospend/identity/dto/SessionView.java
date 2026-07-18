package com.ecospend.identity.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/** One refresh-token-backed session, used for both the active-sessions list and login history. */
public record SessionView(
        UUID id,
        String deviceLabel,
        String ipAddress,
        LocalDateTime createdAt,
        LocalDateTime lastUsedAt,
        LocalDateTime revokedAt,
        boolean isCurrent
) {}
