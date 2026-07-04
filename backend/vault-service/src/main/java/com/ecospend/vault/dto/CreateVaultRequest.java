package com.ecospend.vault.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateVaultRequest(
        @NotBlank @Size(max = 100) String name,
        @Positive BigDecimal targetAmount,
        @NotNull @Future LocalDate lockedUntil
) {}
