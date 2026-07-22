package com.ecospend.vault.repository;

import com.ecospend.vault.models.GroupVaultMember;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupVaultMemberRepository extends JpaRepository<GroupVaultMember, UUID> {
    List<GroupVaultMember> findByGroupId(UUID groupId);
    List<GroupVaultMember> findByGroupIdAndStatus(UUID groupId, GroupVaultMember.Status status);
    List<GroupVaultMember> findByUserId(UUID userId);
    Optional<GroupVaultMember> findByGroupIdAndUserId(UUID groupId, UUID userId);
    long countByGroupId(UUID groupId);
    long countByGroupIdAndStatus(UUID groupId, GroupVaultMember.Status status);
    long countByUserIdAndStatus(UUID userId, GroupVaultMember.Status status);

    /**
     * Row-locks a member for the duration of the caller's transaction.
     * Used by requestWithdrawal() so two near-simultaneous requests from
     * the same member (double-tap, retried request) can't both pass the
     * "no pending request yet" check before either commits — the second
     * call blocks until the first transaction commits, then correctly
     * sees the just-created pending request.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from GroupVaultMember m where m.groupId = :groupId and m.userId = :userId")
    Optional<GroupVaultMember> lockByGroupIdAndUserId(UUID groupId, UUID userId);
}
