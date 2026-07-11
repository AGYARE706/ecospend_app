package com.ecospend.vault.config;

import com.ecospend.vault.exceptions.VaultException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * Tier policy for vault features:
 * FREE  — personal vaults only, max 3; no group vaults
 * PLUS / PREMIUM — unlimited personal; max 10 group vault memberships
 */
@Component
public class VaultTierPolicy {

    public static final int FREE_PERSONAL_VAULT_LIMIT = 3;
    public static final int PLUS_GROUP_VAULT_LIMIT = 10;

    public boolean isPlusOrPremium(String tier) {
        if (tier == null) {
            return false;
        }
        String normalized = tier.toUpperCase();
        return "PLUS".equals(normalized) || "PREMIUM".equals(normalized);
    }

    public boolean isFree(String tier) {
        return !isPlusOrPremium(tier);
    }

    public void requireGroupAccess(String tier) {
        if (!isPlusOrPremium(tier)) {
            throw new VaultException(HttpStatus.FORBIDDEN, "GROUP_VAULT_REQUIRES_PLUS");
        }
    }

    public void assertCanCreatePersonalVault(String tier, long currentPersonalCount) {
        if (isFree(tier) && currentPersonalCount >= FREE_PERSONAL_VAULT_LIMIT) {
            throw new VaultException(HttpStatus.FORBIDDEN, "PERSONAL_VAULT_LIMIT_REACHED");
        }
    }

    public void assertCanJoinOrCreateGroup(String tier, long currentGroupMemberships) {
        requireGroupAccess(tier);
        if (currentGroupMemberships >= PLUS_GROUP_VAULT_LIMIT) {
            throw new VaultException(HttpStatus.FORBIDDEN, "GROUP_VAULT_LIMIT_REACHED");
        }
    }
}
