package com.ecospend.expense.services;

import com.ecospend.expense.dto.ExpenseRequest;
import com.ecospend.expense.models.Expense;
import com.ecospend.expense.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    // Swapped Long to UUID to align with API Gateway token context maps
    public Expense createExpense(ExpenseRequest request, UUID userId) {
        Expense expense = new Expense();
        expense.setUserId(userId);
        expense.setType(request.getType());
        expense.setAmount(request.getAmount());
        expense.setProvider(request.getProvider());
        expense.setCategory(request.getCategory());
        expense.setNotes(request.getNotes());
        
        // Removed explicit createdAt handling; managed by entity @PrePersist

        return expenseRepository.save(expense);
    }
}