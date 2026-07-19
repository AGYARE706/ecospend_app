package com.ecospend.expense.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CoachMessageView(UUID id, String role, String content, OffsetDateTime createdAt) {
}
