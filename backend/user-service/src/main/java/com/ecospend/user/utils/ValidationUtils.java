package com.ecospend.user.utils;

public final class ValidationUtils {

    private ValidationUtils() {}

    public static boolean isValidEmail(String email) {
        return email != null && email.contains("@");
    }
}
