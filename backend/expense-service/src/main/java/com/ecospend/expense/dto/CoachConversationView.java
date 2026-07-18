package com.ecospend.expense.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CoachConversationView(UUID id, String title, OffsetDateTime updatedAt) {
}
