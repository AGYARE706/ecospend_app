package com.ecospend.expense.repository;

import com.ecospend.expense.models.BudgetEnvelope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BudgetEnvelopeRepository extends JpaRepository<BudgetEnvelope, UUID> {

    List<BudgetEnvelope> findByUserId(UUID userId);

    Optional<BudgetEnvelope> findByIdAndUserId(UUID id, UUID userId);

    Optional<BudgetEnvelope> findByUserIdAndCategoryAndMonthAndYear(
            UUID userId, String category, int month, int year);

    /**
     * Atomically adds a real expense onto the matching envelope's
     * running total, if the user has one for that category/month/year.
     * Returns 0 (no-op) when no envelope exists — envelopes are opt-in,
     * so an untracked category simply isn't updated.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE BudgetEnvelope e SET e.currentSpent = e.currentSpent + :amount "
            + "WHERE e.userId = :userId AND e.category = :category "
            + "AND e.month = :month AND e.year = :year")
    int addSpend(@Param("userId") UUID userId, @Param("category") String category,
            @Param("month") int month, @Param("year") int year, @Param("amount") BigDecimal amount);
}
