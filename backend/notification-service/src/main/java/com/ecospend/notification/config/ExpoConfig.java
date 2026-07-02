package com.ecospend.notification.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Builds the RestClient used to talk to the Expo Push API. If an Expo access
 * token is configured (required only when Enhanced Push Security is on) it is
 * attached as a bearer token on every request.
 */
@Configuration
public class ExpoConfig {

    @Bean
    public RestClient expoRestClient(
            @Value("${expo.push.url}") String pushUrl,
            @Value("${expo.push.access-token:}") String accessToken) {

        RestClient.Builder builder = RestClient.builder()
                .baseUrl(pushUrl)
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Content-Type", "application/json");

        if (accessToken != null && !accessToken.isBlank()) {
            builder.defaultHeader("Authorization", "Bearer " + accessToken);
        }

        return builder.build();
    }
}
