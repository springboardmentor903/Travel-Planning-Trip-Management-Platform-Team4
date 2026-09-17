package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetAnalyticsDTO {
    private Double averageBudget;
    private Double minBudget;
    private Double maxBudget;
    private Double totalPlannedBudget;
    private List<BudgetRangeBucket> rangeDistribution;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetRangeBucket {
        private String rangeLabel;
        private long tripCount;
        private double percentage;
    }
}
