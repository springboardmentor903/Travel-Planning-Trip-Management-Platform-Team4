package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DateAnalyticsDTO {
    private Double averageTripDurationDays;
    private List<MonthCountDTO> popularTravelMonths;
    private long upcomingTrips;
    private long ongoingTrips;
    private long completedTrips;
    private long cancelledTrips;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthCountDTO {
        private String monthName;
        private long tripCount;
    }
}
