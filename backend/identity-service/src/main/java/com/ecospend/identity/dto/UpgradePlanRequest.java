package com.ecospend.identity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** Which Plus billing period to purchase. */
public record UpgradePlanRequest(
        @NotBlank
        @Pattern(regexp = "MONTHLY|YEARLY", message = "must be MONTHLY or YEARLY")
        String plan
) {}
