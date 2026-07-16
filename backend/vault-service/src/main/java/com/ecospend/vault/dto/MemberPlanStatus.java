package com.ecospend.vault.dto;

import com.ecospend.vault.models.GroupVaultTransaction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * How one member is doing against the automatic contribution plan.
 * Status is informational only — deposits stay voluntary; being behind
 * just drives the timeline UI and reminder notifications.
 */
public record MemberPlanStatus(
        UUID userId,
        BigDecimal contributed,
        BigDecimal expectedToDate,
        BigDecimal memberShare,
        String status, // ON_TRACK | BEHIND | COMPLETED
        /** Per-instalment breakdown so a member can see exactly which ones they've ticked off. */
        List<MemberInstalment> instalments
) {

    /** {@code paid} reflects the member's CURRENT balance, so a later withdrawal can un-tick it. */
    public record MemberInstalment(
            int index, LocalDate dueDate, BigDecimal amountDue, boolean paid, LocalDate paidDate) {}

    public static MemberPlanStatus of(
            UUID userId, BigDecimal contributed, ContributionPlanView plan,
            List<GroupVaultTransaction> depositsAscending) {
        BigDecimal expected = plan.expectedToDate();
        String status;
        if (contributed.compareTo(plan.memberShare()) >= 0) {
            status = "COMPLETED";
        } else if (contributed.compareTo(expected) >= 0) {
            status = "ON_TRACK";
        } else {
            status = "BEHIND";
        }

        List<MemberInstalment> instalments = plan.instalments().stream()
                .map(item -> {
                    boolean paid = contributed.compareTo(item.cumulativePerMember()) >= 0;
                    LocalDate paidDate = paid
                            ? firstDateReaching(item.cumulativePerMember(), depositsAscending)
                            : null;
                    return new MemberInstalment(
                            item.index(), item.dueDate(), item.cumulativePerMember(), paid, paidDate);
                })
                .toList();

        return new MemberPlanStatus(userId, contributed, expected, plan.memberShare(), status, instalments);
    }

    private static LocalDate firstDateReaching(BigDecimal threshold, List<GroupVaultTransaction> depositsAscending) {
        BigDecimal running = BigDecimal.ZERO;
        for (GroupVaultTransaction tx : depositsAscending) {
            running = running.add(tx.getAmount());
            if (running.compareTo(threshold) >= 0) {
                return tx.getCreatedAt().toLocalDate();
            }
        }
        return null;
    }
}
