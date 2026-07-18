package com.ecospend.expense.dto;

import java.time.OffsetDateTime;

public record InsightOfTheDayResponse(String heading, String message, OffsetDateTime generatedAt) {
}
