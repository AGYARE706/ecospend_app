package com.ecospend.vault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record JoinGroupVaultByCodeRequest(

        @NotBlank(message = "Invite code is required")
        @Size(min = 4, max = 12, message = "Invite code must be 4–12 characters")
        String inviteCode
) {}
