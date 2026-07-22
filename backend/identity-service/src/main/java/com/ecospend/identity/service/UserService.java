package com.ecospend.identity.service;

import com.ecospend.identity.client.NotificationClient;
import com.ecospend.identity.client.PaymentClient;
import com.ecospend.identity.dto.AuthResponse;
import com.ecospend.identity.dto.UpdateUserProfileRequest;
import com.ecospend.identity.dto.UserLookupResult;
import com.ecospend.identity.dto.UserProfileResponse;
import com.ecospend.identity.entity.User;
import com.ecospend.identity.exception.AlreadySubscribedException;
import com.ecospend.identity.exception.InvalidPhotoException;
import com.ecospend.identity.exception.UserNotFoundException;
import com.ecospend.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final String TIER_PLUS = "PLUS";
    private static final String PLAN_MONTHLY = "MONTHLY";
    private static final String PLAN_YEARLY = "YEARLY";
    private static final DateTimeFormatter RENEWAL_DATE_FORMAT = DateTimeFormatter.ofPattern("d MMM yyyy");

    /** EcoSpend Plus prices, charged from the central wallet. */
    static final BigDecimal PLUS_MONTHLY_PRICE_GHS = new BigDecimal("15.00");
    static final BigDecimal PLUS_YEARLY_PRICE_GHS = new BigDecimal("165.00");

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
     * Paid upgrade: charges the chosen plan's price from the user's wallet
     * and only then flips the tier. The wallet charge is the last step
     * inside the transaction, so an insufficient balance rolls the tier
     * flip back. Re-purchasing while a period is still active is rejected
     * — switching/extending mid-period isn't supported, wait for it to end
     * (it'll auto-renew on its own unless cancelled).
     */
    @Transactional
    public AuthResponse upgradeToPlus(UUID userId, String plan) {
        User user = findUser(userId);

        if (TIER_PLUS.equals(user.getSubscriptionTier())
                && user.getSubscriptionExpiresAt() != null
                && user.getSubscriptionExpiresAt().isAfter(LocalDateTime.now())) {
            throw new AlreadySubscribedException(
                    "You're already on Plus until " + user.getSubscriptionExpiresAt().format(RENEWAL_DATE_FORMAT) + ".");
        }

        BigDecimal price = priceFor(plan);
        user.setSubscriptionTier(TIER_PLUS);
        user.setSubscriptionPlan(plan);
        user.setSubscriptionExpiresAt(nextPeriod(LocalDateTime.now(), plan));
        user.setAutoRenew(true);
        userRepository.save(user);

        paymentClient.chargeWallet(userId, price,
                "ecospend-plus-" + UUID.randomUUID(), "EcoSpend Plus (" + plan.toLowerCase() + ")");

        notificationClient.send(userId, "Welcome to EcoSpend Plus",
                "Your upgrade to EcoSpend Plus is confirmed — GHS " + price
                        + " was charged from your wallet. Renews "
                        + (PLAN_MONTHLY.equals(plan) ? "monthly." : "yearly."),
                "PLUS_UPGRADE", Map.of());

        String accessToken = jwtService.generateAccessToken(
                user.getId(),
                user.getSubscriptionTier()
        );

        return AuthResponse.of(accessToken, null, user.getSubscriptionTier(), AuthService.toUserSummary(user));
    }

    /**
     * Turns off auto-renewal without downgrading immediately — Plus stays
     * active for the rest of the period already paid for, then the
     * renewal sweep lapses it to FREE instead of re-charging the wallet.
     */
    @Transactional
    public UserProfileResponse cancelAutoRenew(UUID userId) {
        User user = findUser(userId);
        if (!TIER_PLUS.equals(user.getSubscriptionTier())) {
            throw new AlreadySubscribedException("You're not currently on Plus.");
        }

        user.setAutoRenew(false);
        userRepository.save(user);

        String until = user.getSubscriptionExpiresAt() != null
                ? user.getSubscriptionExpiresAt().format(RENEWAL_DATE_FORMAT)
                : "the end of your current period";
        notificationClient.send(userId, "Auto-renewal cancelled",
                "Plus stays active until " + until + ", then your account moves to the Free plan.",
                "PLUS_AUTO_RENEW_CANCELLED", Map.of());

        return toProfile(user);
    }

    static BigDecimal priceFor(String plan) {
        return PLAN_YEARLY.equals(plan) ? PLUS_YEARLY_PRICE_GHS : PLUS_MONTHLY_PRICE_GHS;
    }

    /** Extends from {@code from} (not "now") so a late renewal sweep doesn't drift the anniversary date forward. */
    static LocalDateTime nextPeriod(LocalDateTime from, String plan) {
        return PLAN_YEARLY.equals(plan) ? from.plusYears(1) : from.plusMonths(1);
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
                user.getSubscriptionPlan(),
                user.getSubscriptionExpiresAt(),
                user.isAutoRenew(),
                user.getProfilePhoto(),
                user.isTwoFactorEnabled(),
                user.isSetupCompleted(),
                user.getMomoProvider(),
                user.getCreatedAt()
        );
    }
}
