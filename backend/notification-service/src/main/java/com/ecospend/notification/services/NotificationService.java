package com.ecospend.notification.services;

import com.ecospend.notification.dto.NotificationResponse;
import com.ecospend.notification.dto.RegisterTokenRequest;
import com.ecospend.notification.dto.SendNotificationRequest;
import com.ecospend.notification.exception.NotFoundException;
import com.ecospend.notification.models.DeviceToken;
import com.ecospend.notification.models.DeviceTokenRepository;
import com.ecospend.notification.models.Notification;
import com.ecospend.notification.models.NotificationRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Owns the notification inbox and Expo device-token registry, and coordinates
 * push delivery. Persisting a notification is the source of truth; push is a
 * best-effort side effect layered on top.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final ExpoPushService expoPushService;
    private final ObjectMapper objectMapper;

    public NotificationService(NotificationRepository notificationRepository,
                               DeviceTokenRepository deviceTokenRepository,
                               ExpoPushService expoPushService,
                               ObjectMapper objectMapper) {
        this.notificationRepository = notificationRepository;
        this.deviceTokenRepository = deviceTokenRepository;
        this.expoPushService = expoPushService;
        this.objectMapper = objectMapper;
    }

    // ---------------------------------------------------------------------
    // Device tokens
    // ---------------------------------------------------------------------

    /** Registers or re-points an Expo token to the given user (idempotent upsert). */
    @Transactional
    public void registerToken(UUID userId, RegisterTokenRequest request) {
        DeviceToken token = deviceTokenRepository.findByExpoPushToken(request.expoPushToken())
                .orElseGet(() -> DeviceToken.builder().expoPushToken(request.expoPushToken()).build());
        token.setUserId(userId);
        token.setPlatform(request.platform());
        token.setDeviceId(request.deviceId());
        deviceTokenRepository.save(token);
    }

    /** Removes a device token, e.g. on logout. Silently ignores unknown tokens. */
    @Transactional
    public void unregisterToken(String expoPushToken) {
        deviceTokenRepository.deleteByExpoPushToken(expoPushToken);
    }

    // ---------------------------------------------------------------------
    // Inbox
    // ---------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<NotificationResponse> list(UUID userId, boolean unreadOnly) {
        List<Notification> notifications = unreadOnly
                ? notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId)
                : notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notifications.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markRead(UUID userId, UUID notificationId) {
        Notification notification = requireOwned(userId, notificationId);
        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public int markAllRead(UUID userId) {
        return notificationRepository.markAllReadForUser(userId);
    }

    @Transactional
    public void delete(UUID userId, UUID notificationId) {
        Notification notification = requireOwned(userId, notificationId);
        notificationRepository.delete(notification);
    }

    // ---------------------------------------------------------------------
    // Send
    // ---------------------------------------------------------------------

    /**
     * Persists a notification and pushes it to all of the target user's
     * registered devices. Dead tokens reported by Expo are pruned.
     */
    @Transactional
    public NotificationResponse send(SendNotificationRequest request) {
        String type = (request.type() == null || request.type().isBlank()) ? "SYSTEM" : request.type();

        Notification notification = notificationRepository.save(Notification.builder()
                .userId(request.userId())
                .title(request.title())
                .body(request.body())
                .type(type)
                .data(writeData(request.data()))
                .read(false)
                .build());

        List<String> tokens = deviceTokenRepository.findByUserId(request.userId()).stream()
                .map(DeviceToken::getExpoPushToken)
                .toList();

        if (!tokens.isEmpty()) {
            Set<String> dead = expoPushService.send(tokens, request.title(), request.body(), request.data());
            dead.forEach(deviceTokenRepository::deleteByExpoPushToken);
        }

        return toResponse(notification);
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    private Notification requireOwned(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification not found"));
        if (!notification.getUserId().equals(userId)) {
            // Do not reveal that the id exists for another user.
            throw new NotFoundException("Notification not found");
        }
        return notification;
    }

    private String writeData(Map<String, Object> data) {
        if (data == null || data.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize notification data payload: {}", e.getMessage());
            return null;
        }
    }

    private Map<String, Object> readData(String data) {
        if (data == null || data.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(data, new TypeReference<Map<String, Object>>() {});
        } catch (JsonProcessingException e) {
            log.warn("Failed to deserialize notification data payload: {}", e.getMessage());
            return null;
        }
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getTitle(),
                n.getBody(),
                n.getType(),
                readData(n.getData()),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
