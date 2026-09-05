package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private UserAnalyticsResponse userAnalytics;
    private TripAnalyticsResponse tripAnalytics;
    private List<DestinationAnalyticsResponse> destinationAnalytics;
    private PlatformStatsResponse platformStats;
}