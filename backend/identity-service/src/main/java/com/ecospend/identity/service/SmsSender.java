package com.ecospend.identity.service;

/**
 * Delivers a one-time code (or any short message) by SMS. Implementation
 * is selected by the `sms.provider` config property — see
 * {@link ConsoleSmsSender} (default, zero-cost, local/dev) and
 * {@link TwilioSmsSender} (real delivery, requires Twilio credentials).
 */
public interface SmsSender {
    void send(String phoneNumber, String message);
}
