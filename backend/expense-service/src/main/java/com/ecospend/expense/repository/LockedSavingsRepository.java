package com.ecospend.expense.repository;

import com.ecospend.expense.models.LockedSavings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LockedSavingsRepository extends JpaRepository<LockedSavings, UUID> {

    /**
     * Automatically generates a query to fetch all locked savings goals
     * belonging to a specific student user.
     */
    List<LockedSavings> findByUserId(Long userId);
}