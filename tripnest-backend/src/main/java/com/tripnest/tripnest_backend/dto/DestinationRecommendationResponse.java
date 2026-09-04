package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DestinationRecommendationResponse {

    private Integer tripId;
    private Integer destinationId;
    private String destinationName;
    private String country;
    private String city;
    private Map<String, List<RecommendedPlaceResponse>> recommendationsByCategory;
    private List<RecommendedPlaceResponse> allRecommendations;
}
