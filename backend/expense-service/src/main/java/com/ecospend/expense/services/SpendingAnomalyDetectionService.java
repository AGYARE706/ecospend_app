package com.ecospend.expense.services;

import com.ecospend.expense.client.GeminiClient;
import com.ecospend.expense.client.NotificationClient;
import com.ecospend.expense.models.Transaction;
import com.ecospend.expense.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * Daily sweep that flags single transactions well above a user's own
 * historical pace for that category (not a budget-limit check — that
 * already happens inline in TransactionRecorder — this catches unusual
 * spikes even for users with no budget envelope set).
 */
@Service
public class SpendingAnomalyDetectionService {

    private static final Logger log = LoggerFactory.getLogger(SpendingAnomalyDetectionService.class);

    private static final BigDecimal ANOMALY_MULTIPLIER = BigDecimal.valueOf(2.5);
    private static final int MIN_HISTORY_SAMPLES = 3;
    private static final int HISTORY_WINDOW_DAYS = 30;
    private static final String NOTIFICATION_TYPE = "SPENDING_ANOMALY";

    private static final String NARRATION_SYSTEM_PROMPT = """
            You write ONE short spending-alert sentence for a budgeting app notification, using only the facts
            given to you. Under 160 characters. Mention the amount and category. No preamble, just the sentence.
            """;

    private final TransactionRepository transactionRepository;
    private final NotificationClient notificationClient;
    private final GeminiClient geminiClient;

    public SpendingAnomalyDetectionService(TransactionRepository transactionRepository,
            NotificationClient notificationClient,
            GeminiClient geminiClient) {
        this.transactionRepository = transactionRepository;
        this.notificationClient = notificationClient;
        this.geminiClient = geminiClient;
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void dailySweep() {
        int sent = run();
        log.info("Spending anomaly sweep sent {} notifications", sent);
    }

    /** Also callable from the internal trigger endpoint for demos/tests. */
    public int run() {
        if (!geminiClient.isConfigured()) {
            return 0;
        }

        OffsetDateTime since = OffsetDateTime.now().minusHours(24);
        int sent = 0;
        for (Transaction candidate : transactionRepository.findByCreatedAtAfter(since)) {
            if (!"EXPENSE".equalsIgnoreCase(candidate.getType()) || candidate.getCategory() == null) {
                continue;
            }
            if (isAnomalous(candidate)) {
                notifyAnomaly(candidate);
                sent++;
            }
        }
        return sent;
    }

    private boolean isAnomalous(Transaction candidate) {
        OffsetDateTime historySince = OffsetDateTime.now().minusDays(HISTORY_WINDOW_DAYS);
        List<Transaction> history = transactionRepository.findByUserId(candidate.getUserId()).stream()
                .filter(t -> !t.getId().equals(candidate.getId()))
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .filter(t -> candidate.getCategory().equalsIgnoreCase(t.getCategory()))
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(historySince))
                .toList();

        if (history.size() < MIN_HISTORY_SAMPLES) {
            return false;
        }

        BigDecimal total = history.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal average = total.divide(BigDecimal.valueOf(history.size()), 2, RoundingMode.HALF_UP);
        if (average.signum() <= 0) {
            return false;
        }

        BigDecimal threshold = average.multiply(ANOMALY_MULTIPLIER);
        return candidate.getAmount().compareTo(threshold) > 0;
    }

    private void notifyAnomaly(Transaction candidate) {
        String fallback = String.format("Your GHS %s spend in %s is unusually high compared to your usual pattern.",
                candidate.getAmount(), candidate.getCategory());
        String body;
        try {
            String prompt = String.format(
                    "A GHS %s transaction just happened in the \"%s\" category — unusually large for this user "
                            + "in that category recently. Write the alert sentence.",
                    candidate.getAmount(), candidate.getCategory());
            String narrated = geminiClient.narrate(NARRATION_SYSTEM_PROMPT, prompt).trim();
            body = narrated.isBlank() ? fallback : narrated;
        } catch (Exception e) {
            log.warn("Anomaly narration failed for transaction {}: {}", candidate.getId(), e.getMessage());
            body = fallback;
        }

        notificationClient.send(candidate.getUserId(), "Unusual spending detected", body, NOTIFICATION_TYPE,
                Map.of(
                        "category", candidate.getCategory(),
                        "amount", candidate.getAmount().toString(),
                        "transactionId", candidate.getId().toString()));
    }
}
