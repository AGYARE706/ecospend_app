package com.ecospend.expense.repository;

import com.ecospend.expense.models.CoachDailyInsight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface CoachDailyInsightRepository extends JpaRepository<CoachDailyInsight, CoachDailyInsight.Key> {

    Optional<CoachDailyInsight> findByUserIdAndInsightDate(UUID userId, LocalDate insightDate);
}
