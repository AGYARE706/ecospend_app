package com.ecospend.identity.exception;

import com.ecospend.identity.dto.ErrorResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Translates exceptions thrown anywhere in the Identity Service into
 * a consistent JSON error shape: { code, message, status, timestamp }.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse handleInvalidCredentials(InvalidCredentialsException ex) {
        return ErrorResponse.of("INVALID_CREDENTIALS", ex.getMessage(), 401);
    }

    @ExceptionHandler(DuplicatePhoneException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponse handleDuplicatePhone(DuplicatePhoneException ex) {
        return ErrorResponse.of("DUPLICATE_PHONE", ex.getMessage(), 409);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("Validation failed");
        return ErrorResponse.of("VALIDATION_ERROR", message, 400);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleConstraintViolation(ConstraintViolationException ex) {
        return ErrorResponse.of("VALIDATION_ERROR", ex.getMessage(), 400);
    }

    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleUserNotFound(UserNotFoundException ex) {
        return ErrorResponse.of("USER_NOT_FOUND", ex.getMessage(), 404);
    }

    @ExceptionHandler(InvalidOtpException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleInvalidOtp(InvalidOtpException ex) {
        return ErrorResponse.of("INVALID_OTP", ex.getMessage(), 400);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleGeneric(Exception ex) {
        return ErrorResponse.of("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
    }
}
