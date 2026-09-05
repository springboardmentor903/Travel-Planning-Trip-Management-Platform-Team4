package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripAnalyticsResponse {
    private Long totalTrips;
    private Long activeTrips;
    private Long completedTrips;
}