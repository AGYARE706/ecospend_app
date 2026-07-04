package com.ecospend.vault.repository;

import com.ecospend.vault.models.GroupWithdrawalRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GroupWithdrawalRequestRepository extends JpaRepository<GroupWithdrawalRequest, UUID> {
    List<GroupWithdrawalRequest> findByGroupIdOrderByCreatedAtDesc(UUID groupId);
    List<GroupWithdrawalRequest> findByGroupIdAndRequesterIdAndStatus(
            UUID groupId, UUID requesterId, GroupWithdrawalRequest.Status status);
}
