package com.ecospend.vault.controllers;

import com.ecospend.vault.dto.AmountRequest;
import com.ecospend.vault.dto.CreateGroupVaultRequest;
import com.ecospend.vault.dto.GroupVaultView;
import com.ecospend.vault.dto.JoinGroupVaultByCodeRequest;
import com.ecospend.vault.dto.VoteRequest;
import com.ecospend.vault.dto.WithdrawalRequestView;
import com.ecospend.vault.models.GroupVaultTransaction;
import com.ecospend.vault.services.GroupVaultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/vault/groups")
@RequiredArgsConstructor
public class GroupVaultController {

    private final GroupVaultService groupVaultService;

    @PostMapping
    public ResponseEntity<GroupVaultView> create(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader(value = "X-User-Tier", defaultValue = "FREE") String tier,
            @Valid @RequestBody CreateGroupVaultRequest request) {
        return new ResponseEntity<>(groupVaultService.create(userId, tier, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<GroupVaultView>> findMine(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(groupVaultService.findMine(userId));
    }

    /** Preview a group vault before joining (no membership required). */
    @GetMapping("/by-code/{code}")
    public ResponseEntity<GroupVaultView> findByInviteCode(@PathVariable String code) {
        return ResponseEntity.ok(groupVaultService.findByInviteCode(code));
    }

    /** Join via invite code — primary mobile path. Must be registered before /{id} routes. */
    @PostMapping("/join")
    public ResponseEntity<GroupVaultView> joinByCode(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader(value = "X-User-Tier", defaultValue = "FREE") String tier,
            @Valid @RequestBody JoinGroupVaultByCodeRequest request) {
        return ResponseEntity.ok(groupVaultService.joinByInviteCode(userId, tier, request.inviteCode()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupVaultView> findOne(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(groupVaultService.findOne(userId, id));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<GroupVaultTransaction>> transactions(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(groupVaultService.findTransactions(userId, id));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<GroupVaultView> join(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader(value = "X-User-Tier", defaultValue = "FREE") String tier,
            @PathVariable UUID id) {
        return ResponseEntity.ok(groupVaultService.join(userId, tier, id));
    }

    // NOTE: there is intentionally no public deposit endpoint. Group
    // contributions come from the central wallet via the payment-service
    // (POST /api/payments/transfers/group → /vault/internal/group-deposits).

    @PostMapping("/{id}/exit")
    public ResponseEntity<GroupVaultView> exit(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(groupVaultService.exit(userId, id));
    }

    @PostMapping("/{id}/withdrawals")
    public ResponseEntity<WithdrawalRequestView> requestWithdrawal(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody AmountRequest request) {
        return new ResponseEntity<>(
                groupVaultService.requestWithdrawal(userId, id, request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/withdrawals")
    public ResponseEntity<List<WithdrawalRequestView>> findWithdrawals(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(groupVaultService.findWithdrawals(userId, id));
    }

    @PostMapping("/{id}/withdrawals/{requestId}/vote")
    public ResponseEntity<WithdrawalRequestView> vote(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id,
            @PathVariable UUID requestId,
            @Valid @RequestBody VoteRequest request) {
        return ResponseEntity.ok(groupVaultService.vote(userId, id, requestId, request.approve()));
    }
}
