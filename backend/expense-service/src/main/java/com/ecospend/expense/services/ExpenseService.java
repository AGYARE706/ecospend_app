package com.ecospend.expense.services;

import com.ecospend.expense.models.Expense;
import com.ecospend.expense.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public List<Expense> findAll(Long userId) {
        if (userId != null) {
            return expenseRepository.findByUserId(userId);
        }
        return expenseRepository.findAll();
    }

    public Expense create(Expense expense) {
        return expenseRepository.save(expense);
    }
}
