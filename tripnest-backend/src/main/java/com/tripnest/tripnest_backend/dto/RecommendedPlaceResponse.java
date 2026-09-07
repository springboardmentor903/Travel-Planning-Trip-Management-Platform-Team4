package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedPlaceResponse {

    private String name;
    private String category;
    private String description;
    private String location;
    private String estimatedDuration;
    private String recommendedTime;
    private String estimatedCost;
    private String popularity;
    private String imageUrl;
    private Double latitude;
    private Double longitude;
}
