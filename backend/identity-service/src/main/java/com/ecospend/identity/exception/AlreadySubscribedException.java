package com.ecospend.identity.exception;

/**
 * Thrown when trying to buy Plus while an active (not yet expired)
 * subscription already exists — switching or extending mid-period isn't
 * supported, wait for the current period to end.
 */
public class AlreadySubscribedException extends RuntimeException {
    public AlreadySubscribedException(String message) {
        super(message);
    }
}
