package com.ecospend.payment.exceptions;

import org.springframework.http.HttpStatus;

public class PaymentException extends RuntimeException {

    private final HttpStatus status;

    public PaymentException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public static PaymentException notFound() {
        return new PaymentException(HttpStatus.NOT_FOUND, "Payment not found");
    }

    public static PaymentException badRequest(String message) {
        return new PaymentException(HttpStatus.BAD_REQUEST, message);
    }

    public static PaymentException upstream(String message) {
        return new PaymentException(HttpStatus.BAD_GATEWAY, message);
    }
}
