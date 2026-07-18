package com.ecospend.expense.dto;

import java.util.UUID;

public record AskCoachResponse(UUID conversationId, CoachMessageView reply) {
}
