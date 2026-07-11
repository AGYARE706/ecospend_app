package com.ecospend.vault.dto;

import com.ecospend.vault.models.GroupVault;
import com.ecospend.vault.models.GroupVaultMember;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

public record GroupVaultView(
        GroupVault group,
        List<GroupVaultMember> members,
        @JsonProperty("amountSaved") BigDecimal totalBalance,
        BigDecimal myContribution
) {}
