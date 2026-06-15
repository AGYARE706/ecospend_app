package com.ecospend.identity.exception;

/**
 * Thrown when attempting to register a phone number that is already in use.
 */
public class DuplicatePhoneException extends RuntimeException {
    public DuplicatePhoneException(String message) {
        super(message);
    }
}