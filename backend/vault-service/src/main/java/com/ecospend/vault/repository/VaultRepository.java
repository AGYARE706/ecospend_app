package com.ecospend.vault.repository;

import com.ecospend.vault.models.Vault;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VaultRepository extends JpaRepository<Vault, UUID> {
    List<Vault> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<Vault> findByIdAndUserId(UUID id, UUID userId);
}
