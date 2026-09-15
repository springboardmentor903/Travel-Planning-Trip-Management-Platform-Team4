package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DestinationAdminDTO {
    private Integer id;
    private String name;
    private String country;
    private String city;
    private String description;
    private String imageUrl;
    private String category;
    private Double latitude;
    private Double longitude;
    private boolean active;
    private Double estimatedBudget;
    private String bestTravelSeason;
    private long tripCount;
}
