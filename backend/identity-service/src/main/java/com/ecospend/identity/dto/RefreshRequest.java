package com.ecospend.identity.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Payload for POST /auth/refresh.
 */
public record RefreshRequest(

        @NotBlank(message = "Refresh token is required")
        String refreshToken
) {}