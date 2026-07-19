package com.ecospend.vault.repository;

import com.ecospend.vault.models.GroupVault;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupVaultRepository extends JpaRepository<GroupVault, UUID> {

    Optional<GroupVault> findByInviteCodeIgnoreCase(String inviteCode);

    boolean existsByInviteCodeIgnoreCase(String inviteCode);

    List<GroupVault> findByStatus(GroupVault.Status status);
}
