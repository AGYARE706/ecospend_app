package com.ecospend.expense.controllers;

import com.ecospend.expense.models.Expense;
import com.ecospend.expense.services.ExpenseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public List<Expense> getAll(@RequestParam(required = false) Long userId) {
        return expenseService.findAll(userId);
    }

    @PostMapping
    public Expense create(@RequestBody Expense expense) {
        return expenseService.create(expense);
    }
}
