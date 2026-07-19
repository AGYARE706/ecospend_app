package com.ecospend.engagement.services;

import com.ecospend.engagement.client.NotificationClient;
import com.ecospend.engagement.models.Achievement;
import com.ecospend.engagement.models.DailyActivity;
import com.ecospend.engagement.models.UserAchievement;
import com.ecospend.engagement.models.UserXp;
import com.ecospend.engagement.repository.AchievementRepository;
import com.ecospend.engagement.repository.DailyActivityRepository;
import com.ecospend.engagement.repository.UserAchievementRepository;
import com.ecospend.engagement.repository.UserLessonProgressRepository;
import com.ecospend.engagement.repository.UserXpRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * The single engine behind badges/streaks/XP. Every engagement-worthy
 * thing that happens anywhere in the app funnels through {@link #handle}
 * as one of a small set of event types — this class owns 100% of the
 * "what does that mean for achievements/streak/XP" logic, so the calling
 * services (expense/vault/identity) stay ignorant of gamification rules.
 */
@Service
public class EngagementEventService {

    private static final Logger log = LoggerFactory.getLogger(EngagementEventService.class);

    /** Streak lengths (in days) that get their own celebratory notification. */
    private static final Set<Integer> STREAK_MILESTONES = Set.of(7, 30, 100);

    public enum EventType {
        TRANSACTION_RECORDED, GOAL_COMPLETED, VAULT_CREATED, VAULT_MATURED, LOGIN, LESSON_COMPLETED
    }

    private final DailyActivityRepository dailyActivityRepository;
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final UserXpRepository userXpRepository;
    private final UserLessonProgressRepository userLessonProgressRepository;
    private final NotificationClient notificationClient;

    public EngagementEventService(DailyActivityRepository dailyActivityRepository,
            AchievementRepository achievementRepository,
            UserAchievementRepository userAchievementRepository,
            UserXpRepository userXpRepository,
            UserLessonProgressRepository userLessonProgressRepository,
            NotificationClient notificationClient) {
        this.dailyActivityRepository = dailyActivityRepository;
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
        this.userXpRepository = userXpRepository;
        this.userLessonProgressRepository = userLessonProgressRepository;
        this.notificationClient = notificationClient;
    }

    /** Returns any achievements newly unlocked by this event, for callers that want to celebrate immediately. */
    @Transactional
    public List<Achievement> handle(UUID userId, EventType type, Map<String, Object> metadata) {
        List<Achievement> newlyUnlocked = new ArrayList<>();

        recordDailyActivity(userId);

        switch (type) {
            case TRANSACTION_RECORDED -> incrementProgress(userId, "hundred_transactions", 1, newlyUnlocked);
            case GOAL_COMPLETED -> incrementProgress(userId, "first_goal_achieved", 1, newlyUnlocked);
            case VAULT_CREATED -> incrementProgress(userId, "first_vault_created", 1, newlyUnlocked);
            case VAULT_MATURED -> incrementProgress(userId, "first_vault_matured", 1, newlyUnlocked);
            case LESSON_COMPLETED -> {
                incrementProgress(userId, "first_lesson_completed", 1, newlyUnlocked);
                long completedLessons = userLessonProgressRepository.countByUserId(userId);
                setProgress(userId, "finance_101_graduate", (int) completedLessons, newlyUnlocked);
            }
            case LOGIN -> {
                // Daily activity above already covers it — logging in is
                // itself the "you were active today" signal.
            }
        }

        evaluateStreak(userId, newlyUnlocked);
        return newlyUnlocked;
    }

    public int calculateCurrentStreak(UUID userId) {
        List<DailyActivity> activity = dailyActivityRepository.findByUserIdOrderByActivityDateDesc(userId);
        if (activity.isEmpty()) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        LocalDate mostRecent = activity.get(0).getActivityDate();
        if (mostRecent.isBefore(today.minusDays(1))) {
            return 0;
        }

        int streak = 0;
        LocalDate expected = mostRecent;
        for (DailyActivity entry : activity) {
            if (entry.getActivityDate().equals(expected)) {
                streak++;
                expected = expected.minusDays(1);
            } else {
                break;
            }
        }
        return streak;
    }

    private void recordDailyActivity(UUID userId) {
        DailyActivity.Key key = new DailyActivity.Key();
        key.setUserId(userId);
        key.setActivityDate(LocalDate.now());
        if (!dailyActivityRepository.existsById(key)) {
            DailyActivity activity = new DailyActivity();
            activity.setUserId(userId);
            activity.setActivityDate(LocalDate.now());
            dailyActivityRepository.save(activity);
        }
    }

    private void evaluateStreak(UUID userId, List<Achievement> newlyUnlocked) {
        int streak = calculateCurrentStreak(userId);
        setProgress(userId, "thirty_day_streak", streak, newlyUnlocked);

        if (STREAK_MILESTONES.contains(streak)) {
            notificationClient.send(userId, "Streak milestone!",
                    String.format("You've been active %d days in a row. Keep it going!", streak),
                    "STREAK_MILESTONE", Map.of("streak", streak));
        }
    }

    private void incrementProgress(UUID userId, String achievementId, int delta, List<Achievement> newlyUnlocked) {
        UserAchievement userAchievement = findOrCreate(userId, achievementId);
        applyProgress(userId, achievementId, userAchievement, userAchievement.getProgress() + delta, newlyUnlocked);
    }

    private void setProgress(UUID userId, String achievementId, int value, List<Achievement> newlyUnlocked) {
        UserAchievement userAchievement = findOrCreate(userId, achievementId);
        applyProgress(userId, achievementId, userAchievement, value, newlyUnlocked);
    }

    private UserAchievement findOrCreate(UUID userId, String achievementId) {
        return userAchievementRepository.findByUserIdAndAchievementId(userId, achievementId)
                .orElseGet(() -> {
                    UserAchievement fresh = new UserAchievement();
                    fresh.setUserId(userId);
                    fresh.setAchievementId(achievementId);
                    fresh.setProgress(0);
                    return fresh;
                });
    }

    private void applyProgress(UUID userId, String achievementId, UserAchievement userAchievement,
            int newProgress, List<Achievement> newlyUnlocked) {
        boolean wasUnlocked = userAchievement.getUnlockedAt() != null;
        userAchievement.setProgress(newProgress);

        Achievement achievement = achievementRepository.findById(achievementId).orElse(null);
        if (achievement == null) {
            log.warn("Unknown achievement id {} — skipping", achievementId);
            return;
        }

        if (!wasUnlocked && newProgress >= achievement.getTarget()) {
            userAchievement.setUnlockedAt(OffsetDateTime.now());
            userAchievementRepository.save(userAchievement);
            creditXp(userId, achievement.getXpReward());
            newlyUnlocked.add(achievement);
            notificationClient.send(userId, "Badge earned!",
                    String.format("You unlocked \"%s\" — %s", achievement.getTitle(), achievement.getDescription()),
                    "BADGE_EARNED", Map.of("achievementId", achievementId));
        } else {
            userAchievementRepository.save(userAchievement);
        }
    }

    void creditXp(UUID userId, int amount) {
        if (amount <= 0) {
            return;
        }
        UserXp xp = userXpRepository.findById(userId).orElseGet(() -> {
            UserXp fresh = new UserXp();
            fresh.setUserId(userId);
            fresh.setTotalXp(0);
            return fresh;
        });
        xp.setTotalXp(xp.getTotalXp() + amount);
        userXpRepository.save(xp);
    }
}
