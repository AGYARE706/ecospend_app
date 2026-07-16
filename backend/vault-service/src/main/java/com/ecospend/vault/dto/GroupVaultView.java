package com.ecospend.vault.dto;

import com.ecospend.vault.models.GroupVault;
import com.ecospend.vault.models.GroupVaultActivity;
import com.ecospend.vault.models.GroupVaultInvite;
import com.ecospend.vault.models.GroupVaultMember;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

public record GroupVaultView(
        GroupVault group,
        List<GroupVaultMember> members,
        @JsonProperty("amountSaved") BigDecimal totalBalance,
        BigDecimal myContribution,
        /** The requesting user's id, so clients can tell which member row is "me" without guessing. Null for unauthenticated previews. */
        java.util.UUID viewerId,
        /** Null when the group has no target amount. */
        ContributionPlanView contributionPlan,
        /** One entry per member; empty when there is no plan. */
        List<MemberPlanStatus> memberPlans,
        /** Who was invited by phone and whether they've joined. Only populated for the creator. */
        List<GroupVaultInvite> invites,
        /** Full event history (joins, contributions, withdrawal steps, exits). Members-only. */
        List<GroupVaultActivity> activity
) {}
