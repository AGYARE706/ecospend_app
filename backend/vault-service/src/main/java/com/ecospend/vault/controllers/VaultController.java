package com.ecospend.vault.controllers;

import com.ecospend.vault.dto.AmountRequest;
import com.ecospend.vault.dto.CreateVaultRequest;
import com.ecospend.vault.models.Vault;
import com.ecospend.vault.models.VaultTransaction;
import com.ecospend.vault.services.VaultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
// Gateway route: /api/vault/** -> stripPrefix(1) -> /vault/**
@RequestMapping("/vault")
@RequiredArgsConstructor
public class VaultController {

    private final VaultService vaultService;

    @PostMapping
    public ResponseEntity<Vault> create(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody CreateVaultRequest request) {
        return new ResponseEntity<>(vaultService.create(userId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Vault>> findAll(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(vaultService.findAll(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vault> findOne(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(vaultService.findOne(userId, id));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<VaultTransaction>> transactions(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(vaultService.findTransactions(userId, id));
    }

    @PostMapping("/{id}/deposit")
    public ResponseEntity<Vault> deposit(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody AmountRequest request) {
        return ResponseEntity.ok(vaultService.deposit(userId, id, request));
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<Vault> withdraw(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody AmountRequest request) {
        return ResponseEntity.ok(vaultService.withdraw(userId, id, request));
    }

    @PostMapping("/{id}/break")
    public ResponseEntity<Vault> breakVault(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(vaultService.breakVault(userId, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id) {
        vaultService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
