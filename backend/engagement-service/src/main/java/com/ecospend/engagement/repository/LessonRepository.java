package com.ecospend.engagement.repository;

import com.ecospend.engagement.models.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, String> {

    List<Lesson> findAllByOrderBySortOrderAsc();

    List<Lesson> findByTrackIdOrderBySortOrderAsc(String trackId);
}
