package com.ecospend.engagement.repository;

import com.ecospend.engagement.models.DailyActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DailyActivityRepository extends JpaRepository<DailyActivity, DailyActivity.Key> {

    List<DailyActivity> findByUserIdOrderByActivityDateDesc(UUID userId);

    long countByUserId(UUID userId);
}
