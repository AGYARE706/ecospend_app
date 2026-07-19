package com.ecospend.engagement.services;

import com.ecospend.engagement.dto.BadgeView;
import com.ecospend.engagement.models.Achievement;
import com.ecospend.engagement.models.UserAchievement;
import com.ecospend.engagement.repository.AchievementRepository;
import com.ecospend.engagement.repository.UserAchievementRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BadgeService {

    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;

    public BadgeService(AchievementRepository achievementRepository,
            UserAchievementRepository userAchievementRepository) {
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
    }

    public List<BadgeView> badgesFor(UUID userId) {
        Map<String, UserAchievement> progress = userAchievementRepository.findByUserId(userId).stream()
                .collect(Collectors.toMap(UserAchievement::getAchievementId, ua -> ua));

        return achievementRepository.findAll().stream()
                .map(achievement -> {
                    UserAchievement userAchievement = progress.get(achievement.getId());
                    int current = userAchievement != null
                            ? Math.min(userAchievement.getProgress(), achievement.getTarget())
                            : 0;
                    boolean unlocked = userAchievement != null && userAchievement.getUnlockedAt() != null;
                    OffsetDateTime unlockedAt = userAchievement != null ? userAchievement.getUnlockedAt() : null;
                    return toView(achievement, current, unlocked, unlockedAt);
                })
                .toList();
    }

    public BadgeView toView(Achievement achievement, int current, boolean unlocked, OffsetDateTime unlockedAt) {
        return new BadgeView(
                achievement.getId(),
                achievement.getTitle(),
                achievement.getDescription(),
                achievement.getIcon(),
                achievement.getCategory().name(),
                achievement.getTarget(),
                current,
                unlocked,
                unlockedAt);
    }
}
