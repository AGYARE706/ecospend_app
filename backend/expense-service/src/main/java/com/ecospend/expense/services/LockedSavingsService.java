package com.ecospend.expense.services;

import com.ecospend.expense.models.LockedSavings;
import com.ecospend.expense.repository.LockedSavingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LockedSavingsService {

    private final LockedSavingsRepository savingsRepository;

    /**
     * Initializes a new locked savings goal.
     * Ensures the starting balance is zero and the maturity status is false.
     */
    public LockedSavings initializeLockGoal(LockedSavings goal, Long userId) {
        goal.setUserId(userId);

        if (goal.getCurrentBalance() == null) {
            goal.setCurrentBalance(BigDecimal.ZERO);
        }

        goal.setMatured(false);
        goal.setCreatedAt(OffsetDateTime.now());

        return savingsRepository.save(goal);
    }

    /**
     * Retrieves all savings goals associated with a specific student ID.
     */
    public List<LockedSavings> getGoalsByUserId(Long userId) {
        return savingsRepository.findByUserId(userId);
    }
}