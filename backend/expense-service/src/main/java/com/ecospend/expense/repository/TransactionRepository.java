package com.ecospend.expense.repository;

import com.ecospend.expense.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findByUserId(UUID userId);

    Optional<Transaction> findByIdAndUserId(UUID id, UUID userId);

    /** Candidates for the anomaly-detection sweep — across all users. */
    List<Transaction> findByCreatedAtAfter(OffsetDateTime since);
}
