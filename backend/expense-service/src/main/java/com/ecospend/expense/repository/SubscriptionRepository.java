package com.ecospend.expense.repository;

import com.ecospend.expense.models.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    List<Subscription> findByUserIdOrderByNextDueDateAsc(UUID userId);

    Optional<Subscription> findByIdAndUserId(UUID id, UUID userId);
}
