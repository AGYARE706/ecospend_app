package com.ecospend.vault.repository;

import com.ecospend.vault.models.GroupVaultActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GroupVaultActivityRepository extends JpaRepository<GroupVaultActivity, UUID> {
    List<GroupVaultActivity> findByGroupIdOrderByCreatedAtDesc(UUID groupId);
}
