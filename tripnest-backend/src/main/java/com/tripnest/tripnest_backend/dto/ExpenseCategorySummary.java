package com.tripnest.tripnest_backend.dto;

import com.tripnest.tripnest_backend.entity.ExpenseCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseCategorySummary {
    private ExpenseCategory category;
    private BigDecimal totalAmount;
}
