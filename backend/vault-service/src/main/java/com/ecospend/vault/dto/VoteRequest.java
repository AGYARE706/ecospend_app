package com.ecospend.vault.dto;

import jakarta.validation.constraints.NotNull;

public record VoteRequest(
        @NotNull Boolean approve
) {}
