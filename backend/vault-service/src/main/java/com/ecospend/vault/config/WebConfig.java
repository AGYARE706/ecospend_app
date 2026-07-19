package com.ecospend.vault.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final TierInterceptor tierInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // /vault/internal/** is service-to-service (gateway-denied from outside),
        // so it carries no user tier and skips the tier gate.
        registry.addInterceptor(tierInterceptor)
                .addPathPatterns("/vault/**")
                .excludePathPatterns("/vault/internal/**");
    }
}
