package com.ecospend.payment.repository;

import com.ecospend.payment.models.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, UUID> {

    Optional<PaymentRecord> findByReference(String reference);

    Optional<PaymentRecord> findByReferenceAndUserId(String reference, UUID userId);

    List<PaymentRecord> findByUserIdOrderByCreatedAtDesc(UUID userId);

    /**
     * Atomically claims a pending record for success processing.
     * Returns 1 only for the single caller that wins the transition,
     * making deposit crediting idempotent under webhook retries and
     * concurrent verify calls.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE PaymentRecord p SET p.status = 'SUCCESS' "
            + "WHERE p.reference = :reference AND p.status = 'PENDING'")
    int markSuccessIfPending(@Param("reference") String reference);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE PaymentRecord p SET p.status = 'FAILED', p.failureReason = :reason "
            + "WHERE p.reference = :reference AND p.status = 'PENDING'")
    int markFailedIfPending(@Param("reference") String reference, @Param("reason") String reason);
}
