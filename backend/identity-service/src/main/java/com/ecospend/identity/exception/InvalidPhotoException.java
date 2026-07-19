package com.ecospend.identity.exception;

/** Thrown when an uploaded profile photo is malformed or too large. */
public class InvalidPhotoException extends RuntimeException {

    public InvalidPhotoException(String message) {
        super(message);
    }
}
