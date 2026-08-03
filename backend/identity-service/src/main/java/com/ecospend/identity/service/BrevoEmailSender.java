package com.ecospend.identity.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

/**
 * Real email delivery via Brevo SMTP. Only active when
 * `otp.email.provider=brevo` (and the spring.mail.* SMTP settings +
 * brevo.from-email are configured) — otherwise {@link ConsoleEmailSender}
 * handles OTP delivery instead.
 * <p>
 * Delivery failures are logged, not thrown, to match {@link ConsoleEmailSender}
 * and the rest of the identity flow: a down mail provider must never surface
 * as a 500 on register/login. The trade-off is that in production a failed
 * send means the user never receives the code, so provider errors here are
 * worth alerting on separately.
 */
@Component
@ConditionalOnProperty(name = "otp.email.provider", havingValue = "brevo")
public class BrevoEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(BrevoEmailSender.class);

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String fromName;

    public BrevoEmailSender(
            JavaMailSender mailSender,
            @Value("${brevo.from-email}") String fromEmail,
            @Value("${brevo.from-name:EcoSpend}") String fromName) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
    }

    @Override
    public void send(String toEmail, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, false);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Brevo email delivery failed for {}: {}", toEmail, e.getMessage());
        }
    }
}
