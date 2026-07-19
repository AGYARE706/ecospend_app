package com.ecospend.notification.exception;

/** Thrown when a notification is not found or does not belong to the caller. */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
