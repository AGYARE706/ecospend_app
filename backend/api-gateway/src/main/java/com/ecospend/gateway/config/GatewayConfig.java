package com.ecospend.gateway.config;

import com.ecospend.gateway.filter.AuthenticationFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    private final AuthenticationFilter authenticationFilter;

    public GatewayConfig(AuthenticationFilter authenticationFilter) {
        this.authenticationFilter = authenticationFilter;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("identity-service", r -> r
                        .path("/api/auth/**")

                        .filters(f -> f.stripPrefix(1))
                        .uri("http://identity-service:8081"))
                .route("identity-users", r -> r
                        .path("/api/users/**")
                        .filters(f -> f.stripPrefix(1)
                                .filter(authenticationFilter.apply(
                                        new AuthenticationFilter.Config())))
                        .uri("http://identity-service:8081"))
                .route("finance-service", r -> r
                        .path("/api/finance/**")
                        .filters(f -> f.stripPrefix(1)
                                .filter(authenticationFilter.apply(
                                        new AuthenticationFilter.Config())))
                        .uri("http://expense-service:8082"))
                .route("vault-service", r -> r
                        .path("/api/vault/**")
                        .filters(f -> f.stripPrefix(1)
                                .filter(authenticationFilter.apply(
                                        new AuthenticationFilter.Config())))
                        .uri("http://vault-service:8083"))
                .route("notification-service", r -> r
                        .path("/api/notifications/**")
                        .filters(f -> f.stripPrefix(1)
                                .filter(authenticationFilter.apply(
                                        new AuthenticationFilter.Config())))
                        .uri("http://notification-service:8084"))
                .build();
    }
}
