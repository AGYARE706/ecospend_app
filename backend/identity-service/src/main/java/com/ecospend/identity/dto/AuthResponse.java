package com.ecospend.identity.dto;

/**
 * Response returned on successful register/login/refresh.
 */
public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tier
) {}