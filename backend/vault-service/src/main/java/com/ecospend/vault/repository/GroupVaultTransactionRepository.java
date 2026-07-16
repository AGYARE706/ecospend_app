package com.ecospend.vault.repository;

import com.ecospend.vault.models.GroupVaultTransaction;
import com.ecospend.vault.models.VaultTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GroupVaultTransactionRepository extends JpaRepository<GroupVaultTransaction, UUID> {
    List<GroupVaultTransaction> findByGroupIdOrderByCreatedAtDesc(UUID groupId);
    List<GroupVaultTransaction> findByGroupIdAndUserIdAndTypeOrderByCreatedAtAsc(
            UUID groupId, UUID userId, VaultTransaction.Type type);
}
