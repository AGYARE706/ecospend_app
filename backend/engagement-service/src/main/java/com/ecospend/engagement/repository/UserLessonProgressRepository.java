package com.ecospend.engagement.repository;

import com.ecospend.engagement.models.UserLessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserLessonProgressRepository extends JpaRepository<UserLessonProgress, UserLessonProgress.Key> {

    List<UserLessonProgress> findByUserId(UUID userId);

    Optional<UserLessonProgress> findByUserIdAndLessonId(UUID userId, String lessonId);

    long countByUserId(UUID userId);
}
