package com.ecospend.identity.repository;

import com.ecospend.identity.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, UUID> {

    Optional<PasswordResetOtp> findFirstByPhoneNumberOrderByCreatedAtDesc(String phoneNumber);

    @Modifying
    void deleteByPhoneNumber(String phoneNumber);

    @Modifying
    void deleteByUserId(UUID userId);
}
