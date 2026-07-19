package com.ecospend.vault.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Path-level vault access gate.
 * Personal vault routes: any authenticated tier (FREE/PLUS/PREMIUM).
 * Group vault routes: PLUS/PREMIUM only.
 * Count limits are enforced in the services.
 */
@Component
public class TierInterceptor implements HandlerInterceptor {

    private final VaultTierPolicy vaultTierPolicy;

    public TierInterceptor(VaultTierPolicy vaultTierPolicy) {
        this.vaultTierPolicy = vaultTierPolicy;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String tier = request.getHeader("X-User-Tier");
        if (tier == null || tier.isBlank()) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Missing subscription tier\"}");
            return false;
        }

        String path = request.getRequestURI();
        boolean isGroupPath = path != null && path.contains("/vault/groups");

        if (isGroupPath && !vaultTierPolicy.isPlusOrPremium(tier)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"GROUP_VAULT_REQUIRES_PLUS\"}");
            return false;
        }

        return true;
    }
}
