package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TravelerDashboardResponse {
    private List<TripResponse> upcomingTrips;
    private BudgetOverviewResponse budgetOverview;
    private List<CategorySummaryResponse> expenseSummary;
    private List<DestinationVisitStatsResponse> destinations;
    private TravelStatsResponse travelStats;
}