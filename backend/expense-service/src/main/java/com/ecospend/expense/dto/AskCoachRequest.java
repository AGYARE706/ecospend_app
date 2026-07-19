package com.ecospend.expense.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record AskCoachRequest(UUID conversationId, @NotBlank String message) {
}
