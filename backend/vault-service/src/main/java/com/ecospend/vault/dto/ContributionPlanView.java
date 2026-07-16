package com.ecospend.vault.dto;

import com.ecospend.vault.models.GroupVault;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * The automatic per-member contribution plan for a group vault. Fully
 * derived from the group's target, planned member count, cadence and
 * maturity date: each member owes an equal share of the target, split
 * into equal instalments from creation until maturity. Nothing is
 * stored — the plan is recomputed deterministically on every read.
 */
public record ContributionPlanView(
        String frequency,
        BigDecimal memberShare,
        BigDecimal instalmentAmount,
        int instalmentCount,
        List<Instalment> instalments,
        LocalDate nextDueDate
) {

    public record Instalment(int index, LocalDate dueDate, BigDecimal cumulativePerMember) {}

    /** Null when the group has no target amount — no plan can be derived. */
    public static ContributionPlanView of(GroupVault group) {
        if (group.getTargetAmount() == null || group.getTargetAmount().signum() <= 0) {
            return null;
        }

        LocalDate start = group.getCreatedAt().toLocalDate();
        LocalDate end = group.getLockedUntil();
        boolean weekly = "WEEKLY".equalsIgnoreCase(group.getContributionFrequency());

        List<LocalDate> dueDates = new ArrayList<>();
        if (weekly) {
            for (LocalDate due = start.plusWeeks(1); due.isBefore(end); due = due.plusWeeks(1)) {
                dueDates.add(due);
            }
        } else {
            for (LocalDate due = start.plusMonths(1); due.isBefore(end); due = due.plusMonths(1)) {
                dueDates.add(due);
            }
        }
        // The final instalment always lands on the maturity date itself.
        dueDates.add(end);

        int count = dueDates.size();
        BigDecimal memberShare = group.getTargetAmount()
                .divide(BigDecimal.valueOf(group.getMaxMembers()), 2, RoundingMode.HALF_UP);
        BigDecimal instalment = memberShare
                .divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);

        List<Instalment> instalments = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            // Clamp the last cumulative to the exact share so rounding
            // never asks members for more or less than they owe.
            BigDecimal cumulative = i == count - 1
                    ? memberShare
                    : instalment.multiply(BigDecimal.valueOf(i + 1));
            instalments.add(new Instalment(i + 1, dueDates.get(i), cumulative));
        }

        LocalDate today = LocalDate.now();
        LocalDate nextDue = dueDates.stream()
                .filter(due -> !due.isBefore(today))
                .findFirst()
                .orElse(null);

        return new ContributionPlanView(
                weekly ? "WEEKLY" : "MONTHLY",
                memberShare,
                instalment,
                count,
                instalments,
                nextDue);
    }

    /** How much each member should have contributed by today. */
    public BigDecimal expectedToDate() {
        LocalDate today = LocalDate.now();
        BigDecimal expected = BigDecimal.ZERO;
        for (Instalment item : instalments) {
            if (!item.dueDate().isAfter(today)) {
                expected = item.cumulativePerMember();
            }
        }
        return expected;
    }

    /** How long until {@code dueDate}, in days from today (negative = past). */
    public static long daysUntil(LocalDate dueDate) {
        return ChronoUnit.DAYS.between(LocalDate.now(), dueDate);
    }
}
