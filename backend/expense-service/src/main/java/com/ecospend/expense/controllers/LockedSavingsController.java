package com.ecospend.expense.controllers;

import com.ecospend.expense.models.LockedSavings;
import com.ecospend.expense.services.LockedSavingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/savings")
@RequiredArgsConstructor
public class LockedSavingsController {

    private final LockedSavingsService savingsService;

    /**
     * POST /api/savings
     * Creates a new locked savings goal.
     */
    @PostMapping
    public ResponseEntity<LockedSavings> createSavingGoal(@RequestBody LockedSavings savingsGoal) {
        // Using the same temporary hardcoded User ID matching your system
        Long temporaryUserId = 1L;

        LockedSavings activeGoal = savingsService.initializeLockGoal(savingsGoal, temporaryUserId);
        return new ResponseEntity<>(activeGoal, HttpStatus.CREATED);
    }

    /**
     * GET /api/savings/user/{userId}
     * Retrieves all savings goals for a specific user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LockedSavings>> getSavingsByUserId(@PathVariable Long userId) {
        List<LockedSavings> goals = savingsService.getGoalsByUserId(userId);
        return new ResponseEntity<>(goals, HttpStatus.OK);
    }
}