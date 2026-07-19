package com.ecospend.expense.controllers;

import com.ecospend.expense.dto.AskCoachRequest;
import com.ecospend.expense.dto.AskCoachResponse;
import com.ecospend.expense.dto.CoachConversationView;
import com.ecospend.expense.dto.CoachMessageView;
import com.ecospend.expense.dto.InsightOfTheDayResponse;
import com.ecospend.expense.exception.ServiceUnavailableException;
import com.ecospend.expense.services.CoachService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/finance/coach")
public class CoachController {

    private final CoachService coachService;

    public CoachController(CoachService coachService) {
        this.coachService = coachService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AskCoachResponse> chat(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody AskCoachRequest request) {
        requireConfigured();
        return ResponseEntity.ok(coachService.chat(userId, request.conversationId(), request.message()));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<CoachConversationView>> conversations(@RequestHeader("X-User-Id") UUID userId) {
        List<CoachConversationView> views = coachService.listConversations(userId).stream()
                .map(c -> new CoachConversationView(c.getId(), c.getTitle(), c.getUpdatedAt()))
                .toList();
        return ResponseEntity.ok(views);
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<CoachMessageView>> messages(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(coachService.getMessages(userId, id));
    }

    @GetMapping("/insight-of-the-day")
    public ResponseEntity<InsightOfTheDayResponse> insightOfTheDay(@RequestHeader("X-User-Id") UUID userId) {
        return coachService.insightOfTheDay(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    private void requireConfigured() {
        if (!coachService.isConfigured()) {
            throw new ServiceUnavailableException("Ask EcoSpend is not configured on this server.");
        }
    }
}
