package com.ecospend.vault.dto;

import com.ecospend.vault.models.GroupWithdrawalRequest;

public record WithdrawalRequestView(
        GroupWithdrawalRequest request,
        long approvals,
        long rejections,
        long activeMembers,
        long approvalsNeeded,
        boolean hasVoted
) {}
