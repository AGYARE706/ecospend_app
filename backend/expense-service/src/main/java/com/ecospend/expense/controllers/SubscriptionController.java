package com.ecospend.expense.controllers;

import com.ecospend.expense.client.PaymentClient;
import com.ecospend.expense.exception.BadRequestException;
import com.ecospend.expense.exception.ResourceNotFoundException;
import com.ecospend.expense.models.Subscription;
import com.ecospend.expense.repository.SubscriptionRepository;
import com.ecospend.expense.services.TransactionRecorder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Recurring bills. "Pay" debits the central wallet (payment-service),
 * auto-records the expense, and advances the due date by one cycle —
 * all in one transaction so a failed wallet debit rolls everything back.
 */
@RestController
@RequestMapping("/finance/subscriptions")
public class SubscriptionController {

    private static final Set<String> CYCLES =
            Set.of(Subscription.CYCLE_MONTHLY, Subscription.CYCLE_YEARLY);

    private final SubscriptionRepository subscriptionRepository;
    private final TransactionRecorder transactionRecorder;
    private final PaymentClient paymentClient;

    public SubscriptionController(SubscriptionRepository subscriptionRepository,
            TransactionRecorder transactionRecorder,
            PaymentClient paymentClient) {
        this.subscriptionRepository = subscriptionRepository;
        this.transactionRecorder = transactionRecorder;
        this.paymentClient = paymentClient;
    }

    @GetMapping
    public ResponseEntity<List<Subscription>> list(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(subscriptionRepository.findByUserIdOrderByNextDueDateAsc(userId));
    }

    @PostMapping
    public ResponseEntity<Subscription> create(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody Subscription subscription) {
        subscription.setId(null);
        subscription.setUserId(userId);
        subscription.setStatus(Subscription.STATUS_ACTIVE);

        if (subscription.getName() == null || subscription.getName().isBlank()) {
            throw new BadRequestException("name is required");
        }
        if (subscription.getAmount() == null
                || subscription.getAmount().signum() <= 0) {
            throw new BadRequestException("amount must be positive");
        }
        if (subscription.getBillingCycle() == null) {
            subscription.setBillingCycle(Subscription.CYCLE_MONTHLY);
        }
        subscription.setBillingCycle(subscription.getBillingCycle().toUpperCase());
        if (!CYCLES.contains(subscription.getBillingCycle())) {
            throw new BadRequestException("billingCycle must be MONTHLY or YEARLY");
        }
        if (subscription.getCategory() == null || subscription.getCategory().isBlank()) {
            subscription.setCategory("Subscription");
        }
        if (subscription.getNextDueDate() == null) {
            subscription.setNextDueDate(LocalDate.now());
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subscriptionRepository.save(subscription));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subscription> update(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody Subscription details) {
        Subscription subscription = find(id, userId);

        if (details.getName() != null && !details.getName().isBlank()) {
            subscription.setName(details.getName());
        }
        if (details.getAmount() != null) {
            if (details.getAmount().signum() <= 0) {
                throw new BadRequestException("amount must be positive");
            }
            subscription.setAmount(details.getAmount());
        }
        if (details.getCategory() != null && !details.getCategory().isBlank()) {
            subscription.setCategory(details.getCategory());
        }
        if (details.getBillingCycle() != null) {
            String cycle = details.getBillingCycle().toUpperCase();
            if (!CYCLES.contains(cycle)) {
                throw new BadRequestException("billingCycle must be MONTHLY or YEARLY");
            }
            subscription.setBillingCycle(cycle);
        }
        if (details.getNextDueDate() != null) {
            subscription.setNextDueDate(details.getNextDueDate());
        }
        if (details.getStatus() != null) {
            String status = details.getStatus().toUpperCase();
            if (!Set.of(Subscription.STATUS_ACTIVE, Subscription.STATUS_CANCELLED).contains(status)) {
                throw new BadRequestException("status must be ACTIVE or CANCELLED");
            }
            subscription.setStatus(status);
        }
        return ResponseEntity.ok(subscriptionRepository.save(subscription));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        subscriptionRepository.delete(find(id, userId));
        return ResponseEntity.noContent().build();
    }

    /**
     * Pays the bill from the wallet: records the expense, advances the
     * due date, then debits the wallet last so an insufficient balance
     * rolls back the local changes.
     */
    @PostMapping("/{id}/pay")
    @Transactional
    public ResponseEntity<Subscription> pay(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        Subscription subscription = find(id, userId);
        if (!Subscription.STATUS_ACTIVE.equals(subscription.getStatus())) {
            throw new BadRequestException("Subscription is cancelled");
        }

        transactionRecorder.record(userId, subscription.getAmount(), "EXPENSE",
                subscription.getCategory(), subscription.getName() + " — subscription payment");

        LocalDate due = subscription.getNextDueDate();
        subscription.setNextDueDate(Subscription.CYCLE_YEARLY.equals(subscription.getBillingCycle())
                ? due.plusYears(1)
                : due.plusMonths(1));
        subscriptionRepository.save(subscription);

        paymentClient.debitWallet(userId, subscription.getAmount(),
                "ecospend-bill-" + UUID.randomUUID());

        return ResponseEntity.ok(subscription);
    }

    private Subscription find(UUID id, UUID userId) {
        return subscriptionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
    }
}
