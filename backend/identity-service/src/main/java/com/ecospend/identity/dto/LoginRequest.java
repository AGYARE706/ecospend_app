package com.ecospend.identity.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Payload for POST /auth/login.
 */
public record LoginRequest(

        @NotBlank(message = "Phone number is required")
        String phoneNumber,

        @NotBlank(message = "PIN is required")
        String pin
) {}