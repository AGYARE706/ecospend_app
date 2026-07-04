package com.ecospend.vault.repository;

import com.ecospend.vault.models.GroupVaultMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupVaultMemberRepository extends JpaRepository<GroupVaultMember, UUID> {
    List<GroupVaultMember> findByGroupId(UUID groupId);
    List<GroupVaultMember> findByUserId(UUID userId);
    Optional<GroupVaultMember> findByGroupIdAndUserId(UUID groupId, UUID userId);
    long countByGroupId(UUID groupId);
    long countByGroupIdAndStatus(UUID groupId, GroupVaultMember.Status status);
}
