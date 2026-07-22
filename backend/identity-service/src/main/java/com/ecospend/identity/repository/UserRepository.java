package com.ecospend.identity.repository;

import com.ecospend.identity.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByPhoneNumber(String phoneNumber);

    boolean existsByPhoneNumber(String phoneNumber);

    /** Plus subscriptions whose current period has ended — feeds the renewal sweep. */
    List<User> findBySubscriptionTierAndSubscriptionExpiresAtBefore(String subscriptionTier, LocalDateTime cutoff);
}