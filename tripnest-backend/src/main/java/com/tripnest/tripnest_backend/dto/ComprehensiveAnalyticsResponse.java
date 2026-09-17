package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComprehensiveAnalyticsResponse {
    private KpiMetrics kpi;
    private UserAnalyticsDTO userAnalytics;
    private TripAnalyticsSection tripAnalytics;
    private DestinationAnalyticsSection destinationAnalytics;
    private BudgetAnalyticsDTO budgetAnalytics;
    private DateAnalyticsDTO dateAnalytics;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KpiMetrics {
        private long totalUsers;
        private long newUsersThisMonth;
        private long activeUsers;
        private long totalTrips;
        private long tripsThisMonth;
        private long totalDestinations;
        private long activeDestinations;
        private Double averageTripBudget;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TripAnalyticsSection {
        private long totalTrips;
        private long upcomingTrips;
        private long ongoingTrips;
        private long completedTrips;
        private long cancelledTrips;
        private List<TripMonthlyCountDTO> tripsOverTime;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DestinationAnalyticsSection {
        private long totalDestinations;
        private long activeDestinations;
        private List<DestinationShareDTO> topDestinations;
        private List<CategoryDistributionDTO> categoryDistribution;
    }
}
