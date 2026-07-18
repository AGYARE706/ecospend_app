package com.ecospend.identity.repository;

import com.ecospend.identity.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface OtpRepository extends JpaRepository<Otp, UUID> {

    Optional<Otp> findFirstByPhoneNumberAndPurposeOrderByCreatedAtDesc(String phoneNumber, Otp.Purpose purpose);

    @Modifying
    void deleteByUserId(UUID userId);

    long countByPhoneNumberAndPurposeAndCreatedAtAfter(
            String phoneNumber, Otp.Purpose purpose, LocalDateTime after);
}
