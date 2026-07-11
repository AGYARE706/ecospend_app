package com.ecospend.identity.dto;

/**
 * Nested user stub returned with auth tokens for mobile AuthContext.
 */
public record UserSummary(
        String name,
        String phone
) {}
