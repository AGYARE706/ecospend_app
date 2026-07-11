package com.ecospend.expense.repository;

import com.ecospend.expense.models.BudgetEnvelope;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BudgetEnvelopeRepository extends JpaRepository<BudgetEnvelope, UUID> {

    List<BudgetEnvelope> findByUserId(UUID userId);

    Optional<BudgetEnvelope> findByIdAndUserId(UUID id, UUID userId);
}
