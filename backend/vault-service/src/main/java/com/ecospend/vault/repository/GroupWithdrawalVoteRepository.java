package com.ecospend.vault.repository;

import com.ecospend.vault.models.GroupWithdrawalVote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupWithdrawalVoteRepository extends JpaRepository<GroupWithdrawalVote, UUID> {
    List<GroupWithdrawalVote> findByRequestId(UUID requestId);
    Optional<GroupWithdrawalVote> findByRequestIdAndVoterId(UUID requestId, UUID voterId);
    long countByRequestIdAndApprove(UUID requestId, boolean approve);
}
