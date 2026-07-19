package com.ecospend.identity.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateMomoProviderRequest(@NotBlank String momoProvider) {}
