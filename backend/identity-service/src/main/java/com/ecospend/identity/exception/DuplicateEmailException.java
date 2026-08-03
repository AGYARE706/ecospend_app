package com.ecospend.identity.exception;

/**
 * Thrown when attempting to register an email that is already in use.
 */
public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String message) {
        super(message);
    }
}
