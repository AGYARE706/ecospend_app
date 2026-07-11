package com.ecospend.identity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Payload for POST /auth/reset-password.
 */
public record ResetPasswordRequest(

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^(0|\\+233)[0-9]{9}$", message = "Invalid Ghanaian phone number")
        String phoneNumber,

        @NotBlank(message = "OTP code is required")
        @Pattern(regexp = "^\\d{6}$", message = "OTP must be 6 digits")
        String code,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
        String password
) {}
