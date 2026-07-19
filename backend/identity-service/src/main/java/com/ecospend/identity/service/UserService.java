package com.ecospend.identity.service;

import com.ecospend.identity.client.NotificationClient;
import com.ecospend.identity.client.PaymentClient;
import com.ecospend.identity.dto.AuthResponse;
import com.ecospend.identity.dto.UpdateUserProfileRequest;
import com.ecospend.identity.dto.UserLookupResult;
import com.ecospend.identity.dto.UserProfileResponse;
import com.ecospend.identity.entity.User;
import com.ecospend.identity.exception.InvalidPhotoException;
import com.ecospend.identity.exception.UserNotFoundException;
import com.ecospend.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final String TIER_PLUS = "PLUS";

    /** Annual price of EcoSpend Plus, charged from the central wallet. */
    static final BigDecimal PLUS_PRICE_GHS = new BigDecimal("36.00");

    /**
     * ~1.5MB of base64 text — generous for a small, compressed square
     * profile photo (the mobile client resizes to ~400px before upload)
     * while keeping the column and JWT-adjacent payloads bounded.
     */
    private static final int MAX_PHOTO_BASE64_LENGTH = 1_500_000;

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PaymentClient paymentClient;
    private final NotificationClient notificationClient;

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
    public UserProfileResponse setTwoFactorEnabled(UUID userId, boolean enabled) {
        User user = findUser(userId);
        user.setTwoFactorEnabled(enabled);
        userRepository.save(user);
        return toProfile(user);
    }

    @Transactional
    public UserProfileResponse setSetupCompleted(UUID userId, boolean completed) {
        User user = findUser(userId);
        user.setSetupCompleted(completed);
        userRepository.save(user);
        return toProfile(user);
    }

    @Transactional
    public UserProfileResponse setMomoProvider(UUID userId, String momoProvider) {
        User user = findUser(userId);
        user.setMomoProvider(momoProvider);
        userRepository.save(user);
        return toProfile(user);
    }

    @Transactional
    public UserProfileResponse updatePhoto(UUID userId, String photoBase64) {
        if (!photoBase64.startsWith("data:image/")) {
            throw new InvalidPhotoException("Photo must be a data URI (data:image/...)");
        }
        if (photoBase64.length() > MAX_PHOTO_BASE64_LENGTH) {
            throw new InvalidPhotoException("Photo is too large — please choose a smaller image");
        }

        User user = findUser(userId);
        user.setProfilePhoto(photoBase64);
        userRepository.save(user);
        return toProfile(user);
    }

    /**
     * Paid upgrade: charges GHS 36 from the user's wallet and only then
     * flips the tier. The wallet charge is the last step inside the
     * transaction, so an insufficient balance rolls the tier flip back.
     * Already-PLUS users are never charged twice.
     */
    @Transactional
    public AuthResponse upgradeToPlus(UUID userId) {
        User user = findUser(userId);

        if (!TIER_PLUS.equals(user.getSubscriptionTier())) {
            user.setSubscriptionTier(TIER_PLUS);
            userRepository.save(user);

            paymentClient.chargeWallet(userId, PLUS_PRICE_GHS,
                    "ecospend-plus-" + UUID.randomUUID(), "EcoSpend Plus (annual)");

            notificationClient.send(userId, "Welcome to EcoSpend Plus",
                    "Your upgrade to EcoSpend Plus is confirmed — GHS " + PLUS_PRICE_GHS
                            + " was charged from your wallet.",
                    "PLUS_UPGRADE", java.util.Map.of());
        }

        String accessToken = jwtService.generateAccessToken(
                user.getId(),
                user.getSubscriptionTier()
        );

        return AuthResponse.of(accessToken, null, user.getSubscriptionTier(), AuthService.toUserSummary(user));
    }

    /** Service-to-service: resolve invitee phone numbers to registered users. Unmatched numbers are omitted. */
    public List<UserLookupResult> lookupByPhone(List<String> phoneNumbers) {
        if (phoneNumbers == null) {
            return List.of();
        }
        return phoneNumbers.stream()
                .filter(p -> p != null && !p.isBlank())
                .map(String::trim)
                .distinct()
                .flatMap(p -> userRepository.findByPhoneNumber(p).stream())
                .map(u -> new UserLookupResult(u.getPhoneNumber(), u.getId(), u.getName()))
                .toList();
    }

    /** Service-to-service: resolve a batch of user ids to their current names. Unmatched ids are omitted. */
    public List<UserLookupResult> lookupByIds(List<UUID> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return List.of();
        }
        return userRepository.findAllById(userIds).stream()
                .map(u -> new UserLookupResult(u.getPhoneNumber(), u.getId(), u.getName()))
                .toList();
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
                user.getProfilePhoto(),
                user.isTwoFactorEnabled(),
                user.isSetupCompleted(),
                user.getMomoProvider(),
                user.getCreatedAt()
        );
    }
}
