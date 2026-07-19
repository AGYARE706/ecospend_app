package com.ecospend.identity.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Default SMS "sender" for local/dev and demos: logs the message instead
 * of paying for and configuring a real provider. Mirrors how Paystack is
 * handled elsewhere in this codebase — a blank/missing provider config
 * means simulated mode, not a broken feature.
 */
@Component
@ConditionalOnProperty(name = "sms.provider", havingValue = "console", matchIfMissing = true)
public class ConsoleSmsSender implements SmsSender {

    private static final Logger log = LoggerFactory.getLogger(ConsoleSmsSender.class);

    @Override
    public void send(String phoneNumber, String message) {
        log.info("[SIMULATED SMS] To {}: {}", phoneNumber, message);
    }
}
