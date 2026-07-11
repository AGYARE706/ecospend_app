package com.ecospend.identity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Payload for POST /auth/forgot-password.
 */
public record ForgotPasswordRequest(

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^(0|\\+233)[0-9]{9}$", message = "Invalid Ghanaian phone number")
        String phoneNumber
) {}
