package com.ecospend.expense.services;

import com.ecospend.expense.dto.ExpenseRequest;
import com.ecospend.expense.models.Expense;
import com.ecospend.expense.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public Expense createExpense(ExpenseRequest request, Long userId) { // Changed to Long
        Expense expense = new Expense();
        expense.setUserId(userId);
        expense.setType(request.getType());
        expense.setAmount(request.getAmount());
        expense.setProvider(request.getProvider());
        expense.setCategory(request.getCategory());
        expense.setNotes(request.getNotes());
        expense.setCreatedAt(OffsetDateTime.now());

        return expenseRepository.save(expense);
    }
}