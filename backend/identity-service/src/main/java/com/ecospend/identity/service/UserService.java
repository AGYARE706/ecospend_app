package com.ecospend.identity.service;

import com.ecospend.identity.dto.AuthResponse;
import com.ecospend.identity.dto.UpdateUserProfileRequest;
import com.ecospend.identity.dto.UserProfileResponse;
import com.ecospend.identity.entity.User;
import com.ecospend.identity.exception.UserNotFoundException;
import com.ecospend.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final String TIER_PLUS = "PLUS";

    private final UserRepository userRepository;
    private final JwtService jwtService;

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
