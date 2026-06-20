package com.ecospend.expense.controllers;

import com.ecospend.expense.dto.ExpenseRequest;
import com.ecospend.expense.models.Expense;
import com.ecospend.expense.services.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<Expense> createExpense(@RequestBody ExpenseRequest request) {
        // Using a temporary hardcoded Long User ID matching your system
        Long temporaryUserId = 1L;

        Expense createdExpense = expenseService.createExpense(request, temporaryUserId);
        return new ResponseEntity<>(createdExpense, HttpStatus.CREATED);
    }
}