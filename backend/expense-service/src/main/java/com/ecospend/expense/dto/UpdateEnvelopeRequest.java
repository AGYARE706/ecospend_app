package com.ecospend.expense.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record UpdateEnvelopeRequest(
        @NotNull
        @Positive
        @JsonProperty("monthlyLimit")
        BigDecimal monthlyLimit
) {}
