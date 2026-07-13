package com.ecospend.identity.service;

import com.ecospend.identity.dto.AuthResponse;
import com.ecospend.identity.dto.ChangePasswordRequest;
import com.ecospend.identity.dto.SessionResponse;
import com.ecospend.identity.dto.UpdateUserProfileRequest;
import com.ecospend.identity.dto.UserProfileResponse;
import com.ecospend.identity.entity.User;
import com.ecospend.identity.exception.InvalidCredentialsException;
import com.ecospend.identity.exception.UserNotFoundException;
import com.ecospend.identity.repository.PasswordResetOtpRepository;
import com.ecospend.identity.repository.RefreshTokenRepository;
import com.ecospend.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final String TIER_PLUS = "PLUS";

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AuthService authService;

    public UserProfileResponse getMe(UUID userId) {
        return toProfile(findUser(userId));
    }

    @Transactional
    public UserProfileResponse updateMe(UUID userId, UpdateUserProfileRequest request) {
        User user = findUser(userId);
        user.setName(request.name());
        userRepository.save(user);
        return toProfile(user);
    }

    @Transactional
    public void savePushToken(UUID userId, String pushToken) {
        User user = findUser(userId);
        user.setPushToken(pushToken);
        userRepository.save(user);
    }

    @Transactional
    public AuthResponse upgradeToPlus(UUID userId) {
        User user = findUser(userId);

        if (!TIER_PLUS.equals(user.getSubscriptionTier())) {
            user.setSubscriptionTier(TIER_PLUS);
            userRepository.save(user);
        }

        String accessToken = jwtService.generateAccessToken(
                user.getId(),
                user.getSubscriptionTier()
        );

        return AuthResponse.of(accessToken, null, user.getSubscriptionTier(), AuthService.toUserSummary(user));
    }

    /**
     * Verifies the current password, stores the new hash, then rotates every
     * session: all refresh tokens are revoked and a fresh pair is issued so
     * the requesting device stays signed in while other devices drop off.
     */
    @Transactional
    public AuthResponse changePassword(UUID userId, ChangePasswordRequest request) {
        User user = findUser(userId);

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        refreshTokenRepository.deleteByUserId(userId);
        return authService.generateTokenPair(user);
    }

    public List<SessionResponse> listSessions(UUID userId, String currentToken) {
        return refreshTokenRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(token -> new SessionResponse(
                        token.getId(),
                        token.getCreatedAt(),
                        token.getExpiresAt(),
                        currentToken != null && currentToken.equals(token.getToken())
                ))
                .toList();
    }

    @Transactional
    public void revokeSession(UUID userId, UUID sessionId) {
        long deleted = refreshTokenRepository.deleteByIdAndUserId(sessionId, userId);
        if (deleted == 0) {
            throw new UserNotFoundException("Session not found");
        }
    }

    /**
     * Soft-deletes the account: marks the user inactive and revokes every
     * refresh token and pending OTP. Login rejects inactive users, and the
     * row is retained so cross-service references stay resolvable.
     */
    @Transactional
    public void deleteAccount(UUID userId) {
        User user = findUser(userId);
        user.setActive(false);
        userRepository.save(user);

        refreshTokenRepository.deleteByUserId(userId);
        passwordResetOtpRepository.deleteByPhoneNumber(user.getPhoneNumber());
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private static UserProfileResponse toProfile(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getPhoneNumber(),
                user.getSubscriptionTier(),
                user.getCreatedAt()
        );
    }
}
