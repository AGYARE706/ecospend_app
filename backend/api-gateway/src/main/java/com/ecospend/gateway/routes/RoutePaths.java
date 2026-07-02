package com.ecospend.gateway.routes;

/**
 * Route path constants for the API gateway.
 * Gateway routing is configured in application.yml.
 */
public final class RoutePaths {

    public static final String USERS = "/api/users/**";
    public static final String EXPENSES = "/api/expenses/**";
    public static final String NOTIFICATIONS = "/api/notifications/**";

    private RoutePaths() {}
}
