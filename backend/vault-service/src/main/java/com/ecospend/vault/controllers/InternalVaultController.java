package com.ecospend.vault.controllers;

import com.ecospend.vault.dto.AmountRequest;
import com.ecospend.vault.dto.InternalDepositRequest;
import com.ecospend.vault.models.Vault;
import com.ecospend.vault.services.VaultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @PostMapping("/deposits")
    public ResponseEntity<Vault> creditVerifiedDeposit(
            @Valid @RequestBody InternalDepositRequest request) {
        Vault vault = vaultService.deposit(
                request.userId(),
                request.vaultId(),
                new AmountRequest(request.amount(), "Paystack deposit " + request.reference()));
        return ResponseEntity.ok(vault);
    }
}
