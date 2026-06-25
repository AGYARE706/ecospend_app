package com.ecospend.identity.dto;

import jakarta.validation.constraints.NotBlank;

public record PushTokenRequest(
        @NotBlank(message = "Push token is required")
        String pushToken
) {}