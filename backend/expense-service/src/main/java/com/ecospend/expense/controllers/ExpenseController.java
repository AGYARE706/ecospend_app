package com.ecospend.expense.controllers;

import com.ecospend.expense.dto.ExpenseRequest;
import com.ecospend.expense.models.Expense;
import com.ecospend.expense.services.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/expenses") // Standardized prefix
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<Expense> createExpense(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody ExpenseRequest request) {

        Expense createdExpense = expenseService.createExpense(request, userId);
        return new ResponseEntity<>(createdExpense, HttpStatus.CREATED);
    }
}