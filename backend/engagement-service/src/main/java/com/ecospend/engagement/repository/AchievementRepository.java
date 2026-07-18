package com.ecospend.engagement.repository;

import com.ecospend.engagement.models.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AchievementRepository extends JpaRepository<Achievement, String> {

    List<Achievement> findByCategory(Achievement.Category category);
}
