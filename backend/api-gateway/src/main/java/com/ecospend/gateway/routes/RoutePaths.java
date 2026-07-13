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
    public static final String PAYMENTS = "/api/payments/**";
    public static final String PAYMENTS_WEBHOOK = "/api/payments/webhook";

    /** Service-to-service paths — denied at the gateway, reachable only on the Docker network. */
    public static final String VAULT_INTERNAL = "/api/vault/internal/**";
    public static final String PAYMENTS_INTERNAL = "/api/payments/internal/**";

    private RoutePaths() {}
}
