package com.ecospend.engagement.controllers;

import com.ecospend.engagement.dto.BadgeView;
import com.ecospend.engagement.dto.CompleteLessonRequest;
import com.ecospend.engagement.dto.LessonCompletionResponse;
import com.ecospend.engagement.dto.LessonDetailView;
import com.ecospend.engagement.dto.LessonTrackView;
import com.ecospend.engagement.dto.StreakResponse;
import com.ecospend.engagement.dto.XpResponse;
import com.ecospend.engagement.models.UserXp;
import com.ecospend.engagement.repository.DailyActivityRepository;
import com.ecospend.engagement.repository.UserXpRepository;
import com.ecospend.engagement.services.BadgeService;
import com.ecospend.engagement.services.EngagementEventService;
import com.ecospend.engagement.services.LessonService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/engagement")
public class EngagementController {

    private final EngagementEventService engagementEventService;
    private final BadgeService badgeService;
    private final LessonService lessonService;
    private final DailyActivityRepository dailyActivityRepository;
    private final UserXpRepository userXpRepository;

    public EngagementController(EngagementEventService engagementEventService,
            BadgeService badgeService,
            LessonService lessonService,
            DailyActivityRepository dailyActivityRepository,
            UserXpRepository userXpRepository) {
        this.engagementEventService = engagementEventService;
        this.badgeService = badgeService;
        this.lessonService = lessonService;
        this.dailyActivityRepository = dailyActivityRepository;
        this.userXpRepository = userXpRepository;
    }

    @GetMapping("/streak")
    public ResponseEntity<StreakResponse> streak(@RequestHeader("X-User-Id") UUID userId) {
        int currentStreak = engagementEventService.calculateCurrentStreak(userId);
        long totalActiveDays = dailyActivityRepository.countByUserId(userId);
        return ResponseEntity.ok(new StreakResponse(currentStreak, totalActiveDays));
    }

    @GetMapping("/badges")
    public ResponseEntity<List<BadgeView>> badges(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(badgeService.badgesFor(userId));
    }

    @GetMapping("/xp")
    public ResponseEntity<XpResponse> xp(@RequestHeader("X-User-Id") UUID userId) {
        int totalXp = userXpRepository.findById(userId).map(UserXp::getTotalXp).orElse(0);
        return ResponseEntity.ok(XpResponse.of(totalXp));
    }

    @GetMapping("/lessons")
    public ResponseEntity<List<LessonTrackView>> lessons(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(lessonService.tracks(userId));
    }

    @GetMapping("/lessons/{id}")
    public ResponseEntity<LessonDetailView> lesson(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable String id) {
        return ResponseEntity.ok(lessonService.lessonDetail(userId, id));
    }

    @PostMapping("/lessons/{id}/complete")
    public ResponseEntity<LessonCompletionResponse> completeLesson(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable String id,
            @Valid @RequestBody CompleteLessonRequest request) {
        return ResponseEntity.ok(lessonService.complete(userId, id, request.quizScore()));
    }
}
