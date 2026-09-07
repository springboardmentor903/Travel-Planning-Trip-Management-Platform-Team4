package com.tripnest.tripnest_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${tripnest.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${tripnest.mail.from:noreply@tripnest.com}")
    private String fromEmail;

    public EmailNotificationService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendNotificationEmail(String recipientEmail, String recipientName, String subject, String messageText) {
        if (!mailEnabled || mailSender == null || recipientEmail == null || recipientEmail.isBlank()) {
            log.debug("Email notification skipped (enabled={}, mailSenderPresent={})", mailEnabled, mailSender != null);
            return;
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(recipientEmail);
            mailMessage.setSubject("TripNest — " + subject);

            String body = String.format(
                "Hello %s,\n\n%s\n\n---\nSafe travels,\nThe TripNest Team",
                recipientName != null && !recipientName.isBlank() ? recipientName : "Traveler",
                messageText
            );
            mailMessage.setText(body);

            mailSender.send(mailMessage);
            log.info("Notification email sent successfully to {}", maskEmail(recipientEmail));
        } catch (MailException ex) {
            log.warn("Failed to send notification email to recipient: {}", ex.getMessage());
        } catch (Exception ex) {
            log.error("Unexpected error sending notification email: {}", ex.getMessage());
        }
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "***";
        }
        int atIdx = email.indexOf("@");
        if (atIdx <= 2) {
            return "***" + email.substring(atIdx);
        }
        return email.substring(0, 2) + "***" + email.substring(atIdx);
    }
}
