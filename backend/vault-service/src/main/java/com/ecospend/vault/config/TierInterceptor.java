package com.ecospend.vault.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Set;

/**
 * Vaults are a Plus/Premium feature. The API gateway validates the JWT
 * and injects the subscriber's tier as X-User-Tier; free-tier (or
 * unidentified) callers are rejected here.
 */
@Component
public class TierInterceptor implements HandlerInterceptor {

    private static final Set<String> ALLOWED_TIERS = Set.of("PLUS", "PREMIUM");

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String tier = request.getHeader("X-User-Tier");
        if (tier == null || !ALLOWED_TIERS.contains(tier.toUpperCase())) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Vaults require a Plus or Premium subscription\"}");
            return false;
        }
        return true;
    }
}
