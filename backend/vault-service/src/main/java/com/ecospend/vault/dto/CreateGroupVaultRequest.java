package com.ecospend.vault.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateGroupVaultRequest(
        @NotBlank @Size(max = 100) String name,
        @Positive BigDecimal targetAmount,
        @NotNull @Future LocalDate lockedUntil,
        @Min(2) @Max(8) Integer maxMembers
) {}
