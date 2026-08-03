package com.ecospend.identity.service;

import com.ecospend.identity.client.EngagementClient;
import com.ecospend.identity.dto.AuthResponse;
import com.ecospend.identity.dto.ForgotPasswordRequest;
import com.ecospend.identity.dto.LoginRequest;
import com.ecospend.identity.dto.LoginResponse;
import com.ecospend.identity.dto.RegisterRequest;
import com.ecospend.identity.dto.RegisterResponse;
import com.ecospend.identity.dto.ResetPasswordRequest;
import com.ecospend.identity.dto.SessionView;
import com.ecospend.identity.dto.UserSummary;
import com.ecospend.identity.dto.VerifyOtpRequest;
import com.ecospend.identity.entity.Otp;
import com.ecospend.identity.entity.RefreshToken;
import com.ecospend.identity.entity.User;
import com.ecospend.identity.exception.AccountLockedException;
import com.ecospend.identity.exception.DuplicateEmailException;
import com.ecospend.identity.exception.DuplicatePhoneException;
import com.ecospend.identity.exception.InvalidCredentialsException;
import com.ecospend.identity.exception.InvalidOtpException;
import com.ecospend.identity.exception.SessionNotFoundException;
import com.ecospend.identity.repository.RefreshTokenRepository;
import com.ecospend.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Handles registration, login, token refresh, logout, and password
 * reset. Passwords are stored as BCrypt hashes — plaintext is never
 * persisted. Registration and (when enabled) login both gate on an SMS
 * OTP via {@link OtpService}; repeated failed logins lock the account
 * out temporarily.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String REGISTRATION_SUBJECT = "Your EcoSpend verification code";
    private static final String REGISTRATION_MESSAGE =
            "Your EcoSpend verification code is %s. It expires in 10 minutes.";
    private static final String PASSWORD_RESET_SUBJECT = "Your EcoSpend password reset code";
    private static final String PASSWORD_RESET_MESSAGE =
            "Your EcoSpend password reset code is %s. It expires in 10 minutes.";
    private static final String LOGIN_2FA_SUBJECT = "Your EcoSpend login code";
    private static final String LOGIN_2FA_MESSAGE =
            "Your EcoSpend login code is %s. It expires in 10 minutes.";

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final LoginAttemptService loginAttemptService;
    private final EngagementClient engagementClient;

    /** Creates the account (unverified) and sends a registration OTP — no tokens yet. */
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new DuplicatePhoneException("Phone number already registered");
        }

        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException("Email already registered");
        }

        User user = User.builder()
                .phoneNumber(request.phoneNumber())
                .email(email)
                .name(request.name())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();
        userRepository.save(user);

        otpService.sendOtp(user, Otp.Purpose.REGISTRATION, REGISTRATION_SUBJECT, REGISTRATION_MESSAGE);
        return new RegisterResponse(user.getPhoneNumber());
    }

    /** Completes registration: verifies the code, marks the phone verified, issues real tokens. */
    @Transactional
    public AuthResponse verifyRegistration(VerifyOtpRequest request, String deviceLabel, String ipAddress) {
        UUID userId = otpService.verifyOtp(request.phoneNumber(), request.code(), Otp.Purpose.REGISTRATION);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidOtpException("Invalid or expired code"));

        user.setPhoneVerified(true);
        userRepository.save(user);
        return generateTokenPair(user, deviceLabel, ipAddress);
    }

    /** Re-sends a registration OTP for an account that hasn't verified yet. */
    @Transactional
    public Map<String, String> resendRegistrationOtp(ForgotPasswordRequest request) {
        User user = userRepository.findByPhoneNumber(request.phoneNumber())
                .filter(u -> !u.isPhoneVerified())
                .orElseThrow(() -> new InvalidCredentialsException("No pending verification for this number"));

        otpService.sendOtp(user, Otp.Purpose.REGISTRATION, REGISTRATION_SUBJECT, REGISTRATION_MESSAGE);
        return Map.of("phone", request.phoneNumber());
    }

    /**
     * Three outcomes: locked out (too many recent failures), tokens
     * issued straight away, or one more OTP step required — either
     * because the phone was never verified, or because the account has
     * 2FA enabled. Failed-attempt counting and lockout apply before any
     * OTP branch, so a locked account can't be used to spam OTP sends.
     */
    @Transactional
    public LoginResponse login(LoginRequest request, String deviceLabel, String ipAddress) {
        User user = userRepository.findByPhoneNumber(request.phoneNumber())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid phone number or password"));

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new AccountLockedException(
                    "Too many failed attempts. Try again after " + user.getLockedUntil() + ".");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            loginAttemptService.registerFailedAttempt(user.getId());
            throw new InvalidCredentialsException("Invalid phone number or password");
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        if (!user.isPhoneVerified()) {
            otpService.sendOtp(user, Otp.Purpose.REGISTRATION, REGISTRATION_SUBJECT, REGISTRATION_MESSAGE);
            return LoginResponse.phoneVerificationRequired(user.getPhoneNumber());
        }

        if (user.isTwoFactorEnabled()) {
            otpService.sendOtp(user, Otp.Purpose.LOGIN_2FA, LOGIN_2FA_SUBJECT, LOGIN_2FA_MESSAGE);
            return LoginResponse.otpRequired(user.getPhoneNumber());
        }

        return LoginResponse.success(generateTokenPair(user, deviceLabel, ipAddress));
    }

    /** Completes a 2FA-gated login. */
    @Transactional
    public AuthResponse verifyLoginOtp(VerifyOtpRequest request, String deviceLabel, String ipAddress) {
        UUID userId = otpService.verifyOtp(request.phoneNumber(), request.code(), Otp.Purpose.LOGIN_2FA);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
        return generateTokenPair(user, deviceLabel, ipAddress);
    }

    /**
     * Always returns a constant-shaped response to avoid revealing
     * whether a phone number has 2FA enabled. Only sends when it does.
     */
    @Transactional
    public Map<String, String> resendLoginOtp(ForgotPasswordRequest request) {
        userRepository.findByPhoneNumber(request.phoneNumber())
                .filter(User::isTwoFactorEnabled)
                .filter(User::isPhoneVerified)
                .ifPresent(user -> otpService.sendOtp(
                        user, Otp.Purpose.LOGIN_2FA, LOGIN_2FA_SUBJECT, LOGIN_2FA_MESSAGE));
        return Map.of("phone", request.phoneNumber());
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        if (!jwtService.validateToken(refreshToken)) {
            throw new InvalidCredentialsException("Invalid or expired refresh token");
        }

        RefreshToken stored = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new InvalidCredentialsException("Refresh token not recognised"));

        if (stored.getRevokedAt() != null || stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            // Left in place (not deleted) so it still shows up in login history —
            // the active-sessions query already excludes it via expiry/revocation.
            throw new InvalidCredentialsException("Refresh token expired");
        }

        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        stored.setLastUsedAt(LocalDateTime.now());
        refreshTokenRepository.save(stored);

        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getSubscriptionTier());
        return AuthResponse.of(newAccessToken, refreshToken, user.getSubscriptionTier(), toUserSummary(user));
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.revokeByToken(refreshToken, LocalDateTime.now());
    }

    /**
     * Always returns success-shaped response to avoid phone enumeration.
     * When the phone is registered, sends a real 6-digit OTP by SMS.
     */
    @Transactional
    public Map<String, String> forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByPhoneNumber(request.phoneNumber());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            otpService.sendOtp(user, Otp.Purpose.PASSWORD_RESET, PASSWORD_RESET_SUBJECT, PASSWORD_RESET_MESSAGE);
        }
        return Map.of("phone", request.phoneNumber());
    }

    @Transactional
    public Map<String, Boolean> resetPassword(ResetPasswordRequest request) {
        UUID userId = otpService.verifyOtp(request.phoneNumber(), request.code(), Otp.Purpose.PASSWORD_RESET);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidOtpException("Invalid or expired code"));

        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        refreshTokenRepository.revokeAllActiveByUserId(user.getId(), LocalDateTime.now());
        return Map.of("success", true);
    }

    AuthResponse generateTokenPair(User user, String deviceLabel, String ipAddress) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getSubscriptionTier());
        String refreshToken = jwtService.generateRefreshToken(user.getId());

        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .userId(user.getId())
                .token(refreshToken)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .userAgent(deviceLabel)
                .ipAddress(ipAddress)
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        engagementClient.fire(user.getId(), "LOGIN", Map.of());

        return AuthResponse.of(accessToken, refreshToken, user.getSubscriptionTier(), toUserSummary(user));
    }

    /** Active sessions for a user, flagging whichever one matches the caller's own refresh token. */
    public List<SessionView> listActiveSessions(UUID userId, String currentRefreshToken) {
        return refreshTokenRepository
                .findByUserIdAndRevokedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(userId, LocalDateTime.now())
                .stream()
                .map(t -> toSessionView(t, currentRefreshToken))
                .toList();
    }

    /** Every session ever created for a user, revoked or not, newest first — capped for a bounded response. */
    public List<SessionView> getLoginHistory(UUID userId) {
        return refreshTokenRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .limit(20)
                .map(t -> toSessionView(t, null))
                .toList();
    }

    @Transactional
    public void revokeSession(UUID userId, UUID sessionId) {
        RefreshToken token = refreshTokenRepository.findById(sessionId)
                .orElseThrow(() -> new SessionNotFoundException("Session not found"));
        if (!token.getUserId().equals(userId)) {
            throw new SessionNotFoundException("Session not found");
        }
        token.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(token);
    }

    private static SessionView toSessionView(RefreshToken token, String currentRefreshToken) {
        return new SessionView(
                token.getId(),
                token.getUserAgent(),
                token.getIpAddress(),
                token.getCreatedAt(),
                token.getLastUsedAt(),
                token.getRevokedAt(),
                currentRefreshToken != null && Objects.equals(token.getToken(), currentRefreshToken));
    }

    static UserSummary toUserSummary(User user) {
        return new UserSummary(user.getName(), user.getPhoneNumber());
    }
}
