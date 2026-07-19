package com.ecospend.engagement.controllers;

import com.ecospend.engagement.dto.EngagementEventRequest;
import com.ecospend.engagement.exception.BadRequestException;
import com.ecospend.engagement.services.EngagementEventService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Service-to-service surface. The API Gateway returns 403 for every
 * /internal/ path, so only services on the Docker network can reach it.
 * expense-service, vault-service, and identity-service fire best-effort
 * events here whenever something engagement-worthy happens.
 */
@RestController
@RequestMapping("/engagement/internal")
public class InternalEngagementController {

    private final EngagementEventService engagementEventService;

    public InternalEngagementController(EngagementEventService engagementEventService) {
        this.engagementEventService = engagementEventService;
    }

    @PostMapping("/events")
    public ResponseEntity<Void> recordEvent(@Valid @RequestBody EngagementEventRequest request) {
        EngagementEventService.EventType type;
        try {
            type = EngagementEventService.EventType.valueOf(request.type());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Unknown event type: " + request.type());
        }
        Map<String, Object> metadata = request.metadata() != null ? request.metadata() : Map.of();
        engagementEventService.handle(request.userId(), type, metadata);
        return ResponseEntity.noContent().build();
    }
}
