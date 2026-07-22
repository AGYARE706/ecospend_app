package com.ecospend.identity.service;

import com.ecospend.identity.client.NotificationClient;
import com.ecospend.identity.client.PaymentClient;
import com.ecospend.identity.entity.User;
import com.ecospend.identity.exception.PaymentRequiredException;
import com.ecospend.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Daily sweep over Plus subscriptions whose current period has ended.
 * Auto-renews by re-charging the wallet when possible; lapses to FREE
 * when auto-renew is off or the charge fails (insufficient balance).
 */
@Service
@RequiredArgsConstructor
public class SubscriptionRenewalService {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionRenewalService.class);
    private static final String TIER_PLUS = "PLUS";
    private static final String TIER_FREE = "FREE";

    private final UserRepository userRepository;
    private final PaymentClient paymentClient;
    private final NotificationClient notificationClient;

    @Scheduled(cron = "0 0 8 * * *")
    public void dailySweep() {
        Result result = run();
        log.info("Subscription renewal sweep: {} renewed, {} lapsed", result.renewed(), result.lapsed());
    }

    public record Result(int renewed, int lapsed) {}

    /** Also callable from the internal trigger endpoint for demos/tests. */
    @Transactional
    public Result run() {
        int renewed = 0;
        int lapsed = 0;
        for (User user : userRepository.findBySubscriptionTierAndSubscriptionExpiresAtBefore(TIER_PLUS, LocalDateTime.now())) {
            if (user.isAutoRenew() && tryRenew(user)) {
                renewed++;
            } else {
                lapse(user);
                lapsed++;
            }
        }
        return new Result(renewed, lapsed);
    }

    private boolean tryRenew(User user) {
        BigDecimal price = UserService.priceFor(user.getSubscriptionPlan());
        try {
            paymentClient.chargeWallet(user.getId(), price,
                    "ecospend-plus-renew-" + UUID.randomUUID(),
                    "EcoSpend Plus renewal (" + user.getSubscriptionPlan().toLowerCase() + ")");
        } catch (PaymentRequiredException e) {
            return false;
        }

        user.setSubscriptionExpiresAt(UserService.nextPeriod(user.getSubscriptionExpiresAt(), user.getSubscriptionPlan()));
        userRepository.save(user);

        notificationClient.send(user.getId(), "Plus renewed",
                "GHS " + price + " was charged from your wallet — Plus is active until "
                        + user.getSubscriptionExpiresAt().toLocalDate() + ".",
                "PLUS_RENEWED", Map.of());
        return true;
    }

    private void lapse(User user) {
        user.setSubscriptionTier(TIER_FREE);
        user.setSubscriptionPlan(null);
        user.setSubscriptionExpiresAt(null);
        userRepository.save(user);

        notificationClient.send(user.getId(), "Plus subscription ended",
                "We couldn't renew your Plus plan, so your account is back on the Free plan. "
                        + "Top up your wallet and upgrade anytime.",
                "PLUS_LAPSED", Map.of());
    }
}
