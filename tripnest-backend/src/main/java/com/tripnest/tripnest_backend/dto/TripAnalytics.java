package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripAnalytics {
    private long totalTrips;
    private long upcomingTrips;
    private long ongoingTrips;
    private long completedTrips;
    private long cancelledTrips;
    private double averageBudget;

    public long getActiveTrips() {
        return ongoingTrips;
    }

    public long getPlannedTrips() {
        return upcomingTrips;
    }
}
