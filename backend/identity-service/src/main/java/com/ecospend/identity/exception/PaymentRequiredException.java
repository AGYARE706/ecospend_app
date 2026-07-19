package com.ecospend.identity.exception;

/** Thrown when the wallet charge for a paid upgrade cannot be completed. */
public class PaymentRequiredException extends RuntimeException {

    public PaymentRequiredException(String message) {
        super(message);
    }
}
