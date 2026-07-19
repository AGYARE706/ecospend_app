package com.ecospend.identity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Payload for POST /auth/register.
 */
public record RegisterRequest(

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^(0|\\+233)[0-9]{9}$", message = "Invalid Ghanaian phone number")
        String phoneNumber,

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
                message = "Password must include an uppercase letter, a lowercase letter, and a number"
        )
        String password
) {}
