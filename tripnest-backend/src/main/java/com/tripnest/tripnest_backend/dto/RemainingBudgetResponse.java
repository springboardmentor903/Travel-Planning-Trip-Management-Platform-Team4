package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RemainingBudgetResponse {

    private BigDecimal totalBudget;
    private BigDecimal totalExpenses;
    private BigDecimal remainingBudget;
}
