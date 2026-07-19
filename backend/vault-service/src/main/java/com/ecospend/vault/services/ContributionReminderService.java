package com.ecospend.vault.services;

import com.ecospend.vault.client.NotificationClient;
import com.ecospend.vault.dto.ContributionPlanView;
import com.ecospend.vault.models.GroupVault;
import com.ecospend.vault.models.GroupVaultMember;
import com.ecospend.vault.repository.GroupVaultMemberRepository;
import com.ecospend.vault.repository.GroupVaultRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Daily sweep that reminds group-vault members when a planned
 * contribution instalment is near (2 days ahead) or due today, but only
 * if they have not already covered that instalment. Reminders are
 * informational — deposits stay voluntary.
 */
@Service
@RequiredArgsConstructor
public class ContributionReminderService {

    private static final Logger log = LoggerFactory.getLogger(ContributionReminderService.class);

    /** Days-before-due that trigger a reminder (2 days ahead + due day). */
    private static final List<Long> REMINDER_OFFSETS = List.of(2L, 0L);

    private final GroupVaultRepository groupRepository;
    private final GroupVaultMemberRepository memberRepository;
    private final NotificationClient notificationClient;

    @Scheduled(cron = "0 0 8 * * *")
    public void dailySweep() {
        int sent = run();
        log.info("Contribution reminder sweep sent {} notifications", sent);
    }

    /** Also callable from the internal trigger endpoint for demos/tests. */
    public int run() {
        int sent = 0;
        for (GroupVault group : groupRepository.findByStatus(GroupVault.Status.ACTIVE)) {
            ContributionPlanView plan = ContributionPlanView.of(group);
            if (plan == null || plan.nextDueDate() == null) {
                continue;
            }

            LocalDate nextDue = plan.nextDueDate();
            long daysUntil = ContributionPlanView.daysUntil(nextDue);
            if (!REMINDER_OFFSETS.contains(daysUntil)) {
                continue;
            }

            // Cumulative amount each member should have in by the coming due date.
            BigDecimal dueCumulative = plan.instalments().stream()
                    .filter(item -> !item.dueDate().isBefore(nextDue))
                    .findFirst()
                    .map(ContributionPlanView.Instalment::cumulativePerMember)
                    .orElse(plan.memberShare());

            for (GroupVaultMember member : memberRepository.findByGroupId(group.getId())) {
                if (member.getStatus() != GroupVaultMember.Status.ACTIVE
                        || member.getBalance().compareTo(dueCumulative) >= 0) {
                    continue;
                }

                BigDecimal outstanding = dueCumulative.subtract(member.getBalance());
                String title = daysUntil == 0
                        ? "Susu contribution due today"
                        : "Susu contribution due in " + daysUntil + " days";
                String body = String.format(
                        "GHS %.2f for \"%s\" is due %s. Contribute from your wallet to stay on track.",
                        outstanding, group.getName(), daysUntil == 0 ? "today" : "on " + nextDue);

                notificationClient.send(member.getUserId(), title, body, "GROUP_VAULT_REMINDER",
                        Map.of("groupVaultId", group.getId().toString(), "dueDate", nextDue.toString()));
                sent++;
            }
        }
        return sent;
    }
}
