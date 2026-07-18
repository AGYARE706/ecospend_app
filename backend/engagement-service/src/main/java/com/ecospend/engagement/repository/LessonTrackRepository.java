package com.ecospend.engagement.repository;

import com.ecospend.engagement.models.LessonTrack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonTrackRepository extends JpaRepository<LessonTrack, String> {

    List<LessonTrack> findAllByOrderBySortOrderAsc();
}
