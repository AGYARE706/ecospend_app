package com.ecospend.vault.repository;

import com.ecospend.vault.models.GroupVaultInvite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupVaultInviteRepository extends JpaRepository<GroupVaultInvite, UUID> {
    List<GroupVaultInvite> findByGroupIdOrderByCreatedAtAsc(UUID groupId);
    Optional<GroupVaultInvite> findByGroupIdAndPhoneNumber(UUID groupId, String phoneNumber);
    Optional<GroupVaultInvite> findByGroupIdAndInvitedUserId(UUID groupId, UUID invitedUserId);
}
