package com.ecospend.vault.exceptions;

import org.springframework.http.HttpStatus;

public class VaultException extends RuntimeException {

    private final HttpStatus status;

    public VaultException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public static VaultException notFound() {
        return new VaultException(HttpStatus.NOT_FOUND, "Vault not found");
    }

    public static VaultException conflict(String message) {
        return new VaultException(HttpStatus.CONFLICT, message);
    }

    public static VaultException badRequest(String message) {
        return new VaultException(HttpStatus.BAD_REQUEST, message);
    }
}
