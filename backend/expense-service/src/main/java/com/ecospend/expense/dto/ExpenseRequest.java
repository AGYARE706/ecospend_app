package com.ecospend.expense.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ExpenseRequest {
    private String type; // INCOME or EXPENSE
    private BigDecimal amount;
    private String provider;
    private String category;
    private String notes;
}
