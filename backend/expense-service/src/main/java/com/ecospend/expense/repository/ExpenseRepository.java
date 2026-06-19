package com.ecospend.expense.repository;

import com.ecospend.expense.models.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> { // Changed UUID to Long
    List<Expense> findByUserId(Long userId); // Changed UUID to Long
}