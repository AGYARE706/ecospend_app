package com.ecospend.identity.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Default email "sender" for local/dev and demos: logs the message instead
 * of sending real mail. Mirrors how Paystack is handled elsewhere in this
 * codebase — a blank/missing provider config means simulated mode, not a
 * broken feature. The OTP appears in identity-service stdout.
 */
@Component
@ConditionalOnProperty(name = "otp.email.provider", havingValue = "console", matchIfMissing = true)
public class ConsoleEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(ConsoleEmailSender.class);

    @Override
    public void send(String toEmail, String subject, String body) {
        log.info("[SIMULATED EMAIL] To {} | {} | {}", toEmail, subject, body);
    }
}
