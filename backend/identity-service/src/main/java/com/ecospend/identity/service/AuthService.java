package com.ecospend.identity.service;

import com.ecospend.identity.dto.AuthResponse;
import com.ecospend.identity.dto.ForgotPasswordRequest;
import com.ecospend.identity.dto.LoginRequest;
import com.ecospend.identity.dto.RegisterRequest;
import com.ecospend.identity.dto.ResetPasswordRequest;
import com.ecospend.identity.dto.UserSummary;
import com.ecospend.identity.entity.PasswordResetOtp;
import com.ecospend.identity.entity.RefreshToken;
import com.ecospend.identity.entity.User;
import com.ecospend.identity.exception.DuplicatePhoneException;
import com.ecospend.identity.exception.InvalidCredentialsException;
import com.ecospend.identity.exception.InvalidOtpException;
import com.ecospend.identity.repository.PasswordResetOtpRepository;
import com.ecospend.identity.repository.RefreshTokenRepository;
import com.ecospend.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

/**
 * Handles registration, login, token refresh, logout, and password reset.
 * Passwords are stored as BCrypt hashes — plaintext is never persisted.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final int OTP_TTL_MINUTES = 10;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new DuplicatePhoneException("Phone number already registered");
        }

        User user = User.builder()
                .phoneNumber(request.phoneNumber())
                .name(request.name())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();

        userRepository.save(user);
        return generateTokenPair(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByPhoneNumber(request.phoneNumber())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid phone number or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid phone number or password");
        }

        return generateTokenPair(user);
    }

    public AuthResponse refresh(String refreshToken) {
        if (!jwtService.validateToken(refreshToken)) {
            throw new InvalidCredentialsException("Invalid or expired refresh token");
        }

        RefreshToken stored = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new InvalidCredentialsException("Refresh token not recognised"));

        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.deleteByToken(refreshToken);
            throw new InvalidCredentialsException("Refresh token expired");
        }

        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getSubscriptionTier());
        return AuthResponse.of(newAccessToken, refreshToken, user.getSubscriptionTier(), toUserSummary(user));
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.deleteByToken(refreshToken);
    }

    /**
     * Always returns success-shaped response to avoid phone enumeration.
     * When the phone is registered, issues a 6-digit OTP (logged in all profiles for local/dev).
     */
    @Transactional
    public Map<String, String> forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByPhoneNumber(request.phoneNumber());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            passwordResetOtpRepository.deleteByPhoneNumber(request.phoneNumber());

            String code = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
            PasswordResetOtp otp = PasswordResetOtp.builder()
                    .userId(user.getId())
                    .phoneNumber(request.phoneNumber())
                    .codeHash(passwordEncoder.encode(code))
                    .expiresAt(LocalDateTime.now().plusMinutes(OTP_TTL_MINUTES))
                    .build();
            passwordResetOtpRepository.save(otp);

            log.info("Password reset OTP for {}: {} (expires in {} min)",
                    request.phoneNumber(), code, OTP_TTL_MINUTES);
        }

        return Map.of("phone", request.phoneNumber());
    }

    @Transactional
    public Map<String, Boolean> resetPassword(ResetPasswordRequest request) {
        PasswordResetOtp otp = passwordResetOtpRepository
                .findFirstByPhoneNumberOrderByCreatedAtDesc(request.phoneNumber())
                .orElseThrow(() -> new InvalidOtpException("Invalid or expired OTP"));

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            passwordResetOtpRepository.deleteByPhoneNumber(request.phoneNumber());
            throw new InvalidOtpException("Invalid or expired OTP");
        }

        if (!passwordEncoder.matches(request.code(), otp.getCodeHash())) {
            throw new InvalidOtpException("Invalid or expired OTP");
        }

        User user = userRepository.findById(otp.getUserId())
                .orElseThrow(() -> new InvalidOtpException("Invalid or expired OTP"));

        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(user);

        passwordResetOtpRepository.deleteByPhoneNumber(request.phoneNumber());
        refreshTokenRepository.deleteByUserId(user.getId());

        return Map.of("success", true);
    }

    AuthResponse generateTokenPair(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getSubscriptionTier());
        String refreshToken = jwtService.generateRefreshToken(user.getId());

        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .userId(user.getId())
                .token(refreshToken)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        return AuthResponse.of(accessToken, refreshToken, user.getSubscriptionTier(), toUserSummary(user));
    }

    static UserSummary toUserSummary(User user) {
        return new UserSummary(user.getName(), user.getPhoneNumber());
    }
}
