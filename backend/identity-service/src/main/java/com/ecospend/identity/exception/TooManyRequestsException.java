package com.ecospend.identity.exception;

/**
 * Thrown when an OTP is requested too many times for the same phone
 * number and purpose within the rate-limit window.
 */
public class TooManyRequestsException extends RuntimeException {
    public TooManyRequestsException(String message) {
        super(message);
    }
}
