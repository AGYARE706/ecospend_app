package com.ecospend.identity.exception;

/**
 * Thrown when login is attempted while the account is temporarily
 * locked out after too many consecutive failed password attempts.
 */
public class AccountLockedException extends RuntimeException {
    public AccountLockedException(String message) {
        super(message);
    }
}
