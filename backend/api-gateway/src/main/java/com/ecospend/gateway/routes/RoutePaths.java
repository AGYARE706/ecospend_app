package com.ecospend.gateway.routes;

/**
 * Route path constants for the API gateway — single source of truth
 * used by {@link com.ecospend.gateway.config.GatewayConfig}.
 */
public final class RoutePaths {

    public static final String AUTH = "/api/auth/**";
    public static final String USERS = "/api/users/**";
    public static final String FINANCE = "/api/finance/**";
    public static final String VAULT = "/api/vault/**";
    public static final String NOTIFICATIONS = "/api/notifications/**";
    public static final String NOTIFICATIONS_SEND = "/api/notifications/send";

    private RoutePaths() {}
}
