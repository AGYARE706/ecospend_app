package com.ecospend.identity.dto;

/**
 * Login can resolve three ways: straight through, blocked pending phone
 * verification (rare — only accounts that never finished registering),
 * or blocked pending a login OTP (2FA enabled). `phone` and `auth` are
 * mutually exclusive with each other depending on `status`.
 */
public record LoginResponse(
        Status status,
        String phone,
        AuthResponse auth
) {
    public enum Status { SUCCESS, OTP_REQUIRED, PHONE_VERIFICATION_REQUIRED }

    public static LoginResponse success(AuthResponse auth) {
        return new LoginResponse(Status.SUCCESS, null, auth);
    }

    public static LoginResponse otpRequired(String phone) {
        return new LoginResponse(Status.OTP_REQUIRED, phone, null);
    }

    public static LoginResponse phoneVerificationRequired(String phone) {
        return new LoginResponse(Status.PHONE_VERIFICATION_REQUIRED, phone, null);
    }
}
