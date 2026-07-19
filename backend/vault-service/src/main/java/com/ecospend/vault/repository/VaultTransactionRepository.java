package com.ecospend.vault.repository;

import com.ecospend.vault.models.VaultTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VaultTransactionRepository extends JpaRepository<VaultTransaction, UUID> {
    List<VaultTransaction> findByVaultIdAndUserIdOrderByCreatedAtDesc(UUID vaultId, UUID userId);
}
