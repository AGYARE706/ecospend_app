package com.ecospend.identity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyOtpRequest(

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^(0|\\+233)[0-9]{9}$", message = "Invalid Ghanaian phone number")
        String phoneNumber,

        @NotBlank(message = "OTP code is required")
        @Pattern(regexp = "^\\d{6}$", message = "OTP must be 6 digits")
        String code
) {}
