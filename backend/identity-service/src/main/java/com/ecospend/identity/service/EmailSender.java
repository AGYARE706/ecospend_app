package com.ecospend.identity.service;

/**
 * Delivers a one-time code (or any short message) to an email address.
 * Implementation is selected by the `otp.email.provider` config property —
 * see {@link ConsoleEmailSender} (default, zero-cost, local/dev) and
 * {@link BrevoEmailSender} (real delivery via Brevo SMTP).
 */
public interface EmailSender {
    void send(String toEmail, String subject, String body);
}
