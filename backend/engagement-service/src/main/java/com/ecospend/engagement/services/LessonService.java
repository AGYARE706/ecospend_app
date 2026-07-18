package com.ecospend.engagement.services;

import com.ecospend.engagement.dto.LessonCompletionResponse;
import com.ecospend.engagement.dto.LessonDetailView;
import com.ecospend.engagement.dto.LessonSummaryView;
import com.ecospend.engagement.dto.LessonTrackView;
import com.ecospend.engagement.dto.QuizQuestionView;
import com.ecospend.engagement.exception.ResourceNotFoundException;
import com.ecospend.engagement.models.Achievement;
import com.ecospend.engagement.models.Lesson;
import com.ecospend.engagement.models.QuizQuestion;
import com.ecospend.engagement.models.UserLessonProgress;
import com.ecospend.engagement.repository.LessonRepository;
import com.ecospend.engagement.repository.LessonTrackRepository;
import com.ecospend.engagement.repository.QuizQuestionRepository;
import com.ecospend.engagement.repository.UserLessonProgressRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LessonService {

    private final LessonTrackRepository trackRepository;
    private final LessonRepository lessonRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final UserLessonProgressRepository progressRepository;
    private final EngagementEventService engagementEventService;
    private final BadgeService badgeService;
    private final ObjectMapper objectMapper;

    public LessonService(LessonTrackRepository trackRepository,
            LessonRepository lessonRepository,
            QuizQuestionRepository quizQuestionRepository,
            UserLessonProgressRepository progressRepository,
            EngagementEventService engagementEventService,
            BadgeService badgeService,
            ObjectMapper objectMapper) {
        this.trackRepository = trackRepository;
        this.lessonRepository = lessonRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.progressRepository = progressRepository;
        this.engagementEventService = engagementEventService;
        this.badgeService = badgeService;
        this.objectMapper = objectMapper;
    }

    public List<LessonTrackView> tracks(UUID userId) {
        Set<String> completed = completedLessonIds(userId);
        return trackRepository.findAllByOrderBySortOrderAsc().stream()
                .map(track -> {
                    List<LessonSummaryView> lessons = lessonRepository.findByTrackIdOrderBySortOrderAsc(track.getId())
                            .stream()
                            .map(lesson -> new LessonSummaryView(
                                    lesson.getId(), lesson.getTitle(), lesson.getSummary(),
                                    lesson.getXpReward(), completed.contains(lesson.getId())))
                            .toList();
                    return new LessonTrackView(track.getId(), track.getTitle(), track.getDescription(),
                            track.getIcon(), lessons);
                })
                .toList();
    }

    public LessonDetailView lessonDetail(UUID userId, String lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        boolean completed = progressRepository.findByUserIdAndLessonId(userId, lessonId).isPresent();
        List<QuizQuestionView> quiz = quizQuestionRepository.findByLessonIdOrderBySortOrderAsc(lessonId).stream()
                .map(this::toQuizView)
                .toList();
        return new LessonDetailView(lesson.getId(), lesson.getTrackId(), lesson.getTitle(), lesson.getSummary(),
                lesson.getContent(), lesson.getXpReward(), completed, quiz);
    }

    @Transactional
    public LessonCompletionResponse complete(UUID userId, String lessonId, int quizScore) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));

        Optional<UserLessonProgress> existing = progressRepository.findByUserIdAndLessonId(userId, lessonId);
        if (existing.isPresent()) {
            UserLessonProgress progress = existing.get();
            progress.setQuizScore(quizScore);
            progressRepository.save(progress);
            return new LessonCompletionResponse(0, List.of());
        }

        UserLessonProgress progress = new UserLessonProgress();
        progress.setUserId(userId);
        progress.setLessonId(lessonId);
        progress.setQuizScore(quizScore);
        progressRepository.save(progress);

        List<Achievement> newlyUnlocked = engagementEventService.handle(
                userId, EngagementEventService.EventType.LESSON_COMPLETED, java.util.Map.of("lessonId", lessonId));
        engagementEventService.creditXp(userId, lesson.getXpReward());

        java.time.OffsetDateTime now = java.time.OffsetDateTime.now();
        return new LessonCompletionResponse(
                lesson.getXpReward(),
                newlyUnlocked.stream().map(a -> badgeService.toView(a, a.getTarget(), true, now)).toList());
    }

    private Set<String> completedLessonIds(UUID userId) {
        return progressRepository.findByUserId(userId).stream()
                .map(UserLessonProgress::getLessonId)
                .collect(Collectors.toSet());
    }

    private QuizQuestionView toQuizView(QuizQuestion question) {
        List<String> choices;
        try {
            choices = objectMapper.readValue(question.getChoices(), new TypeReference<List<String>>() {
            });
        } catch (Exception e) {
            choices = List.of();
        }
        return new QuizQuestionView(question.getId(), question.getQuestion(), choices,
                question.getCorrectIndex(), question.getExplanation());
    }
}
