package com.ecospend.gateway.config;

import com.ecospend.gateway.filter.AuthenticationFilter;
import com.ecospend.gateway.routes.RoutePaths;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import reactor.core.publisher.Mono;

@Configuration
public class GatewayConfig {

    private final AuthenticationFilter authenticationFilter;

    public GatewayConfig(AuthenticationFilter authenticationFilter) {
        this.authenticationFilter = authenticationFilter;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Declared first so no service route can ever match an
                // /internal/ path: those endpoints take identity from the
                // request body and must stay service-to-service only.
                .route("deny-internal", r -> r
                        .path(RoutePaths.VAULT_INTERNAL,
                                RoutePaths.PAYMENTS_INTERNAL,
                                RoutePaths.FINANCE_INTERNAL,
                                RoutePaths.USERS_INTERNAL,
                                RoutePaths.ENGAGEMENT_INTERNAL)
                        .filters(f -> f.filter((exchange, chain) -> {
                            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                            exchange.getResponse().getHeaders()
                                    .setContentType(MediaType.APPLICATION_JSON);
                            byte[] body = "{\"error\":\"/internal/ endpoints are service-to-service only\"}"
                                    .getBytes();
                            return exchange.getResponse().writeWith(
                                    Mono.just(exchange.getResponse().bufferFactory().wrap(body)));
                        }))
                        .uri("http://payment-service:8085"))
                .route("identity-service", r -> r
                        .path(RoutePaths.AUTH)
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://identity-service:8081"))
                .route("identity-users", r -> r
                        .path(RoutePaths.USERS)
                        .and().not(p -> p.path(RoutePaths.USERS_INTERNAL))
                        .filters(f -> f.stripPrefix(1)
                                .filter(authenticationFilter.apply(
                                        new AuthenticationFilter.Config())))
                        .uri("http://identity-service:8081"))
                .route("finance-service", r -> r
                        .path(RoutePaths.FINANCE)
                        .and().not(p -> p.path(RoutePaths.FINANCE_INTERNAL))
                        .filters(f -> f.stripPrefix(1)
                                .filter(authenticationFilter.apply(
                                        new AuthenticationFilter.Config())))
                        .uri("http://expense-service:8082"))
                .route("vault-service", r -> r
                        .path(RoutePaths.VAULT)
                        .and().not(p -> p.path(RoutePaths.VAULT_INTERNAL))
                        .filters(f -> f.stripPrefix(1)
                                .filter(authenticationFilter.apply(
                                        new AuthenticationFilter.Config())))
                        .uri("http://vault-service:8083"))
                // Paystack webhook: no JWT — the payment-service verifies the
                // HMAC-SHA512 x-paystack-signature over the raw body instead.
                .route("payments-webhook", r -> r
                        .path(RoutePaths.PAYMENTS_WEBHOOK)
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://payment-service:8085"))
                .route("payment-service", r -> r
                        .path(RoutePaths.PAYMENTS)
                        .and().not(p -> p.path(RoutePaths.PAYMENTS_WEBHOOK))
                        .and().not(p -> p.path(RoutePaths.PAYMENTS_INTERNAL))
                        .filters(f -> f.stripPrefix(1)
                                .filter(authenticationFilter.apply(
                                        new AuthenticationFilter.Config())))
                        .uri("http://payment-service:8085"))
                // Block public access to S2S send endpoint (must be before notifications catch-all)
                .route("deny-notification-send", r -> r
                        .path(RoutePaths.NOTIFICATIONS_SEND)
                        .filters(f -> f.filter((exchange, chain) -> {
                            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                            exchange.getResponse().getHeaders()
                                    .setContentType(MediaType.APPLICATION_JSON);
                            byte[] body = "{\"error\":\"POST /api/notifications/send is service-to-service only\"}"
                                    .getBytes();
                            return exchange.getResponse().writeWith(
                                    Mono.just(exchange.getResponse().bufferFactory().wrap(body)));
                        }))
                        .uri("http://notification-service:8084"))
                .route("notification-service", r -> r
                        .path(RoutePaths.NOTIFICATIONS)
                        .and().not(p -> p.path(RoutePaths.NOTIFICATIONS_SEND))
                        .filters(f -> f.stripPrefix(1)
                                .filter(authenticationFilter.apply(
                                        new AuthenticationFilter.Config())))
                        .uri("http://notification-service:8084"))
                .route("engagement-service", r -> r
                        .path(RoutePaths.ENGAGEMENT)
                        .and().not(p -> p.path(RoutePaths.ENGAGEMENT_INTERNAL))
                        .filters(f -> f.stripPrefix(1)
                                .filter(authenticationFilter.apply(
                                        new AuthenticationFilter.Config())))
                        .uri("http://engagement-service:8086"))
                .build();
    }
}
