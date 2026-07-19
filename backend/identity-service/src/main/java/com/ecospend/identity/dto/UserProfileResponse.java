package com.ecospend.identity.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Profile payload for GET/PUT /users/me — field names align with mobile AuthUser.
 */
public record UserProfileResponse(
        UUID id,
        String name,
        @JsonProperty("phone") String phoneNumber,
        @JsonProperty("tier") String subscriptionTier,
        @JsonProperty("photoUrl") String profilePhoto,
        boolean twoFactorEnabled,
        boolean setupCompleted,
        String momoProvider,
        LocalDateTime createdAt
) {}
