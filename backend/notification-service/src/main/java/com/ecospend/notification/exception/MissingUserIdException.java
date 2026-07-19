package com.ecospend.notification.exception;

/** Thrown when a caller-scoped endpoint is hit without the X-User-Id header. */
public class MissingUserIdException extends RuntimeException {
    public MissingUserIdException(String message) {
        super(message);
    }
}
