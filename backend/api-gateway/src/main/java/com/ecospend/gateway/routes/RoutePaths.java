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
    public static final String PAYMENTS = "/api/payments/**";
    public static final String NOTIFICATIONS = "/api/notifications/**";
    public static final String NOTIFICATIONS_SEND = "/api/notifications/send";

    /**
     * Paystack calls this without a JWT; authenticity is enforced
     * downstream by the HMAC-SHA512 signature over the raw body.
     */
    public static final String PAYMENTS_WEBHOOK = "/api/payments/webhook";

    // Service-to-service surfaces. The gateway must 403 these: internal
    // endpoints take identity from the request body, not the JWT, so a
    // public route would let any caller move other users' money.
    public static final String VAULT_INTERNAL = "/api/vault/internal/**";
    public static final String PAYMENTS_INTERNAL = "/api/payments/internal/**";
    public static final String FINANCE_INTERNAL = "/api/finance/internal/**";
    public static final String USERS_INTERNAL = "/api/users/internal/**";

    private RoutePaths() {}
}
