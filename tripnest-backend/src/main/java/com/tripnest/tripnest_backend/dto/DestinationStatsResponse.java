package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DestinationStatsResponse {
    private long totalDestinations;
    private long activeDestinations;
    private long inactiveDestinations;
    private String mostPopularDestinationName;
    private long mostPopularDestinationTripCount;
    private Map<String, Long> categoryDistribution;
}
