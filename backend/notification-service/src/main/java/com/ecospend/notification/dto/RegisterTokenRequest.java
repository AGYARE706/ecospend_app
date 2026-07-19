package com.ecospend.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Payload for POST /notifications/tokens — sent after the app obtains an
 * Expo push token from expo-notifications.
 */
public record RegisterTokenRequest(

        @NotBlank(message = "Expo push token is required")
        @Pattern(
                regexp = "^ExponentPushToken\\[.+\\]$|^ExpoPushToken\\[.+\\]$",
                message = "Not a valid Expo push token"
        )
        String expoPushToken,

        String platform,

        String deviceId
) {}
