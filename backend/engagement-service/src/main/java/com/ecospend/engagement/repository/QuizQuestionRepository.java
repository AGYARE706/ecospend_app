package com.ecospend.engagement.repository;

import com.ecospend.engagement.models.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {

    List<QuizQuestion> findByLessonIdOrderBySortOrderAsc(String lessonId);
}
