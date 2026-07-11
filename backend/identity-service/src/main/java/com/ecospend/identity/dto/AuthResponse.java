package com.ecospend.identity.dto;

/**
 * Response returned on successful register/login/refresh/upgrade.
 */
public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tier,
        UserSummary user
) {
    public static AuthResponse of(String accessToken, String refreshToken, String tier, UserSummary user) {
        return new AuthResponse(accessToken, refreshToken, tier, user);
    }
}
