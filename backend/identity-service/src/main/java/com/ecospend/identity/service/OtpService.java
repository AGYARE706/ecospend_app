package com.ecospend.identity.service;

import com.ecospend.identity.entity.Otp;
import com.ecospend.identity.exception.InvalidOtpException;
import com.ecospend.identity.exception.TooManyRequestsException;
import com.ecospend.identity.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Generates, sends, and verifies one-time codes for all three OTP-gated
 * flows (registration, password reset, login 2FA), sharing one rate
 * limit and one attempt cap so none of the three can be brute-forced or
 * used to spam a phone number with SMS.
 */
@Service
@RequiredArgsConstructor
public class OtpService {

    private static final int OTP_TTL_MINUTES = 10;
    /** Per (phone, purpose): at most this many codes issued per rolling hour. */
    private static final int MAX_SENDS_PER_HOUR = 5;
    /** Per code: at most this many wrong guesses before it's invalidated. */
    private static final int MAX_VERIFY_ATTEMPTS = 5;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final OtpRepository otpRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final SmsSender smsSender;

    /**
     * {@code messageTemplate} must contain exactly one {@code %s} for the
     * code. Deliberately does NOT clear prior rows for this
     * (phone, purpose) before inserting — verifyOtp() always looks up
     * the most recent one regardless, and keeping history is what lets
     * the rate limit above actually count repeated sends instead of
     * only ever seeing the single still-live row.
     */
    @Transactional
    public void sendOtp(UUID userId, String phoneNumber, Otp.Purpose purpose, String messageTemplate) {
        long recentSends = otpRepository.countByPhoneNumberAndPurposeAndCreatedAtAfter(
                phoneNumber, purpose, LocalDateTime.now().minusHours(1));
        if (recentSends >= MAX_SENDS_PER_HOUR) {
            throw new TooManyRequestsException("Too many verification codes requested. Try again in a bit.");
        }

        String code = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
        Otp otp = Otp.builder()
                .userId(userId)
                .phoneNumber(phoneNumber)
                .purpose(purpose)
                .codeHash(passwordEncoder.encode(code))
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_TTL_MINUTES))
                .build();
        otpRepository.save(otp);

        smsSender.send(phoneNumber, String.format(messageTemplate, code));
    }

    /** Returns the OTP's userId on success; throws InvalidOtpException otherwise. Consumes the code either way on success. */
    @Transactional
    public UUID verifyOtp(String phoneNumber, String code, Otp.Purpose purpose) {
        Otp otp = otpRepository.findFirstByPhoneNumberAndPurposeOrderByCreatedAtDesc(phoneNumber, purpose)
                .orElseThrow(() -> new InvalidOtpException("Invalid or expired code"));

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            otpRepository.deleteById(otp.getId());
            throw new InvalidOtpException("Invalid or expired code");
        }

        if (otp.getAttempts() >= MAX_VERIFY_ATTEMPTS) {
            otpRepository.deleteById(otp.getId());
            throw new InvalidOtpException("Too many incorrect attempts — request a new code");
        }

        if (!passwordEncoder.matches(code, otp.getCodeHash())) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);
            throw new InvalidOtpException("Invalid or expired code");
        }

        UUID userId = otp.getUserId();
        otpRepository.deleteById(otp.getId());
        return userId;
    }
}
