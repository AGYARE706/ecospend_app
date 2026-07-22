package com.ecospend.vault.repository;

import com.ecospend.vault.models.GroupVault;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupVaultRepository extends JpaRepository<GroupVault, UUID> {

    Optional<GroupVault> findByInviteCodeIgnoreCase(String inviteCode);

    boolean existsByInviteCodeIgnoreCase(String inviteCode);

    List<GroupVault> findByStatus(GroupVault.Status status);

    /**
     * Row-locks the group for the duration of the caller's transaction.
     * Used by join() so two concurrent joins against the same group can't
     * both read the same "7 of 8 members" count and both insert, pushing
     * membership past maxMembers — the second caller blocks until the
     * first transaction commits, then re-reads the up-to-date count.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select g from GroupVault g where g.id = :id")
    Optional<GroupVault> lockById(UUID id);
}
