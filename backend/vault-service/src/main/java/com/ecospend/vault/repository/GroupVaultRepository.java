package com.ecospend.vault.repository;

import com.ecospend.vault.models.GroupVault;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GroupVaultRepository extends JpaRepository<GroupVault, UUID> {
}
