package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsResponse {
    private long totalUsers;
    private TripAnalytics tripAnalytics;
    private List<DestinationAnalytics> popularDestinations;
    private PlatformStats platformStats;
    private List<TripMonthlyCountDTO> tripsOverTime;
}
