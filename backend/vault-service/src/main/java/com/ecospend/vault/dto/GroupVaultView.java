package com.ecospend.vault.dto;

import com.ecospend.vault.models.GroupVault;
import com.ecospend.vault.models.GroupVaultMember;

import java.math.BigDecimal;
import java.util.List;

public record GroupVaultView(
        GroupVault group,
        List<GroupVaultMember> members,
        BigDecimal totalBalance
) {}
