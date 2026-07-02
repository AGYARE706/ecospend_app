package com.ecospend.notification.dto;

/**
 * Response for GET /notifications/unread-count — used to badge the app icon
 * / bell without pulling the whole inbox.
 */
public record UnreadCountResponse(long count) {}
