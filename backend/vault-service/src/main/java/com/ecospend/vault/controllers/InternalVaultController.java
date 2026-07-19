package com.ecospend.vault.controllers;

import com.ecospend.vault.dto.AmountRequest;
import com.ecospend.vault.dto.GroupVaultView;
import com.ecospend.vault.dto.InternalDepositRequest;
import com.ecospend.vault.dto.InternalGroupDepositRequest;
import com.ecospend.vault.models.GroupVault;
import com.ecospend.vault.models.GroupVaultMember;
import com.ecospend.vault.models.Vault;
import com.ecospend.vault.repository.GroupVaultMemberRepository;
import com.ecospend.vault.repository.GroupVaultRepository;
import com.ecospend.vault.services.ContributionReminderService;
import com.ecospend.vault.services.GroupVaultService;
import com.ecospend.vault.services.VaultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Internal (service-to-service) vault operations. The API Gateway denies
 * every /internal/ path, so these endpoints are only reachable from other
 * services on the Docker network — the mobile client cannot credit a
 * vault directly.
 */
@RestController
@RequestMapping("/vault/internal")
@RequiredArgsConstructor
public class InternalVaultController {

    private final VaultService vaultService;
    private final GroupVaultService groupVaultService;
    private final ContributionReminderService contributionReminderService;
    private final GroupVaultMemberRepository groupVaultMemberRepository;
    private final GroupVaultRepository groupVaultRepository;

    @PostMapping("/deposits")
    public ResponseEntity<Vault> creditVerifiedDeposit(
            @Valid @RequestBody InternalDepositRequest request) {
        Vault vault = vaultService.deposit(
                request.userId(),
                request.vaultId(),
                new AmountRequest(request.amount(), "Wallet transfer " + request.reference()));
        return ResponseEntity.ok(vault);
    }

    /**
     * Membership rules (ACTIVE group, ACTIVE member) are still enforced
     * by GroupVaultService.deposit; only the tier gate is skipped, since
     * a wallet transfer carries no gateway-injected tier header.
     */
    @PostMapping("/group-deposits")
    public ResponseEntity<GroupVaultView> creditGroupContribution(
            @Valid @RequestBody InternalGroupDepositRequest request) {
        GroupVaultView view = groupVaultService.deposit(
                request.userId(),
                request.groupId(),
                new AmountRequest(request.amount(), "Wallet contribution " + request.reference()));
        return ResponseEntity.ok(view);
    }

    /**
     * Manually triggers the daily contribution-reminder sweep — the cron
     * runs at 08:00, so demos and tests need a way to fire it on demand.
     */
    @PostMapping("/run-reminders")
    public ResponseEntity<Map<String, Integer>> runReminders() {
        return ResponseEntity.ok(Map.of("sent", contributionReminderService.run()));
    }

    /**
     * Read-only vault snapshot for the expense-service AI coach's
     * get_vault_summary tool. Personal + group vault balances only —
     * no transaction history.
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary(@RequestParam UUID userId) {
        List<Map<String, Object>> personalVaults = vaultService.findAll(userId).stream()
                .map(vault -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", vault.getName());
                    m.put("balance", vault.getBalance());
                    m.put("targetAmount", vault.getTargetAmount());
                    m.put("maturityDate", vault.getMaturityDate());
                    return m;
                })
                .toList();

        List<Map<String, Object>> groupVaults = groupVaultMemberRepository.findByUserId(userId).stream()
                .filter(member -> member.getStatus() == GroupVaultMember.Status.ACTIVE)
                .map(member -> groupVaultRepository.findById(member.getGroupId())
                        .map(group -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("name", group.getName());
                            m.put("myBalance", member.getBalance());
                            m.put("targetAmount", group.getTargetAmount());
                            m.put("lockedUntil", group.getLockedUntil());
                            return m;
                        })
                        .orElse(null))
                .filter(java.util.Objects::nonNull)
                .toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("personalVaults", personalVaults);
        result.put("groupVaults", groupVaults);
        return ResponseEntity.ok(result);
    }
}
