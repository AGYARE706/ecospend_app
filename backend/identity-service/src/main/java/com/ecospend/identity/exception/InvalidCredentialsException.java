package com.ecospend.identity.exception;

/**
 * Thrown when a login attempt fails due to incorrect phone number or password.
 */
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}