package com.ecospend.vault.controllers;

import com.ecospend.vault.dto.AmountRequest;
import com.ecospend.vault.dto.GroupVaultView;
import com.ecospend.vault.dto.InternalDepositRequest;
import com.ecospend.vault.dto.InternalGroupDepositRequest;
import com.ecospend.vault.models.Vault;
import com.ecospend.vault.services.ContributionReminderService;
import com.ecospend.vault.services.GroupVaultService;
import com.ecospend.vault.services.VaultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

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
}
