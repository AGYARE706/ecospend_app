package com.ecospend.engagement.dto;

public record XpResponse(int totalXp, int level) {

    private static final int XP_PER_LEVEL = 200;

    public static XpResponse of(int totalXp) {
        return new XpResponse(totalXp, 1 + (totalXp / XP_PER_LEVEL));
    }
}
