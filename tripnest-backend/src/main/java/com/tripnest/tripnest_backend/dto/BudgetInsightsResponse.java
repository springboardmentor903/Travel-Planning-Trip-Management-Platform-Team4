package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetInsightsResponse {

    private String estimatedDailyBudget;
    private String accommodationCost;
    private String foodCost;
    private String transportationCost;
    private String activitiesCost;
    private String totalEstimatedCost;
    private String budgetMessage;
}
