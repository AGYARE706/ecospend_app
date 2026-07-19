package com.ecospend.identity.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Real SMS delivery via Twilio. Only active when `sms.provider=twilio`
 * (and TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER are
 * set) — otherwise {@link ConsoleSmsSender} handles OTP delivery instead.
 * Delivery failures are logged, not thrown: a down SMS provider must
 * never be why a user can't see their own (already-generated) OTP in
 * server logs during a demo — but in production this would mean the
 * user never receives the code, so treat provider errors as a signal
 * worth alerting on separately.
 */
@Component
@ConditionalOnProperty(name = "sms.provider", havingValue = "twilio")
public class TwilioSmsSender implements SmsSender {

    private static final Logger log = LoggerFactory.getLogger(TwilioSmsSender.class);

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.from-number}")
    private String fromNumber;

    @PostConstruct
    void init() {
        Twilio.init(accountSid, authToken);
    }

    @Override
    public void send(String phoneNumber, String message) {
        try {
            Message.creator(new PhoneNumber(toE164(phoneNumber)), new PhoneNumber(fromNumber), message).create();
        } catch (Exception e) {
            log.error("Twilio SMS delivery failed for {}: {}", phoneNumber, e.getMessage());
        }
    }

    /** Registration stores local "0XXXXXXXXX" numbers; Twilio needs E.164. */
    private static String toE164(String phoneNumber) {
        if (phoneNumber.startsWith("+")) {
            return phoneNumber;
        }
        if (phoneNumber.startsWith("0")) {
            return "+233" + phoneNumber.substring(1);
        }
        return "+" + phoneNumber;
    }
}
