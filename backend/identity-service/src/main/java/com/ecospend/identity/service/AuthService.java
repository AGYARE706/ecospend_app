package com.ecospend.identity.service;

import com.ecospend.identity.dto.AuthResponse;
import com.ecospend.identity.dto.LoginRequest;
import com.ecospend.identity.dto.RegisterRequest;
import com.ecospend.identity.entity.RefreshToken;
import com.ecospend.identity.entity.User;
import com.ecospend.identity.exception.DuplicatePhoneException;
import com.ecospend.identity.exception.InvalidCredentialsException;
import com.ecospend.identity.repository.RefreshTokenRepository;
import com.ecospend.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Handles registration, login, token refresh, and logout.
 * PINs are stored as BCrypt hashes — the plaintext PIN is never persisted.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    /**
     * Registers a new user. Throws DuplicatePhoneException if the phone
     * number is already registered.
     */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new DuplicatePhoneException("Phone number already registered");
        }

        User user = User.builder()
                .phoneNumber(request.phoneNumber())
                .name(request.name())
                .pinHash(passwordEncoder.encode(request.pin()))
                .build();

        userRepository.save(user);

        return generateTokenPair(user);
    }

    /**
     * Authenticates a user by phone number and PIN.
     * Throws InvalidCredentialsException if either is incorrect.
     * Both failure cases return the same error message and status
     * to avoid revealing whether a phone number is registered.
     */
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByPhoneNumber(request.phoneNumber())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid phone number or PIN"));

        if (!passwordEncoder.matches(request.pin(), user.getPinHash())) {
            throw new InvalidCredentialsException("Invalid phone number or PIN");
        }

        return generateTokenPair(user);
    }

    /**
     * Issues a new access token given a valid, unexpired refresh token.
     * The refresh token itself is not rotated.
     */
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

        return new AuthResponse(newAccessToken, refreshToken, user.getSubscriptionTier());
    }

    /**
     * Invalidates a refresh token, logging the user out of that session.
     */
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.deleteByToken(refreshToken);
    }

    /**
     * Generates a new access/refresh token pair for a user and persists
     * the refresh token for later validation.
     */
    private AuthResponse generateTokenPair(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getSubscriptionTier());
        String refreshToken = jwtService.generateRefreshToken(user.getId());

        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .userId(user.getId())
                .token(refreshToken)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        return new AuthResponse(accessToken, refreshToken, user.getSubscriptionTier());
    }
}