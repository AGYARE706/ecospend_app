package com.ecospend.notification.controllers;

import com.ecospend.notification.dto.NotificationResponse;
import com.ecospend.notification.dto.RegisterTokenRequest;
import com.ecospend.notification.dto.SendNotificationRequest;
import com.ecospend.notification.dto.UnreadCountResponse;
import com.ecospend.notification.exception.MissingUserIdException;
import com.ecospend.notification.services.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Notification inbox + Expo token registry.
 *
 * User-scoped endpoints identify the caller via the {@code X-User-Id} header
 * (the identity user's UUID), matching the finance-service convention. The
 * API Gateway is expected to populate this from the validated JWT `sub` claim.
 *
 * {@code POST /notifications/send} is service-to-service (userId in the body)
 * and is not meant to be exposed publicly through the gateway.
 */
@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private static final String USER_ID_HEADER = "X-User-Id";

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // --- Device tokens ----------------------------------------------------

    @PostMapping("/tokens")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void registerToken(@RequestHeader(value = USER_ID_HEADER, required = false) String userId,
                              @Valid @RequestBody RegisterTokenRequest request) {
        notificationService.registerToken(requireUserId(userId), request);
    }

    @DeleteMapping("/tokens/{expoPushToken}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unregisterToken(@PathVariable String expoPushToken) {
        notificationService.unregisterToken(expoPushToken);
    }

    // --- Inbox ------------------------------------------------------------

    @GetMapping
    public List<NotificationResponse> list(
            @RequestHeader(value = USER_ID_HEADER, required = false) String userId,
            @RequestParam(name = "unreadOnly", defaultValue = "false") boolean unreadOnly) {
        return notificationService.list(requireUserId(userId), unreadOnly);
    }

    @GetMapping("/unread-count")
    public UnreadCountResponse unreadCount(
            @RequestHeader(value = USER_ID_HEADER, required = false) String userId) {
        return new UnreadCountResponse(notificationService.unreadCount(requireUserId(userId)));
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markRead(
            @RequestHeader(value = USER_ID_HEADER, required = false) String userId,
            @PathVariable UUID id) {
        return notificationService.markRead(requireUserId(userId), id);
    }

    @PostMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead(@RequestHeader(value = USER_ID_HEADER, required = false) String userId) {
        notificationService.markAllRead(requireUserId(userId));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(value = USER_ID_HEADER, required = false) String userId,
                       @PathVariable UUID id) {
        notificationService.delete(requireUserId(userId), id);
    }

    // --- Send (service-to-service) ---------------------------------------

    @PostMapping("/send")
    public ResponseEntity<NotificationResponse> send(@Valid @RequestBody SendNotificationRequest request) {
        NotificationResponse response = notificationService.send(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // --- Helpers ----------------------------------------------------------

    private UUID requireUserId(String header) {
        if (header == null || header.isBlank()) {
            throw new MissingUserIdException("X-User-Id header is required");
        }
        try {
            return UUID.fromString(header);
        } catch (IllegalArgumentException ex) {
            throw new MissingUserIdException("X-User-Id must be a valid UUID");
        }
    }
}
