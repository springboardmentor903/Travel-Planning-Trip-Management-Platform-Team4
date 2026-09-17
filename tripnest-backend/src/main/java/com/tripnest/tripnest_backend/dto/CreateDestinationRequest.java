package com.tripnest.tripnest_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateDestinationRequest {
    @NotBlank(message = "Destination name is required")
    private String name;

    @NotBlank(message = "Country is required")
    private String country;

    private String city;
    private String description;
    private String imageUrl;
    private String category;
    private Double latitude;
    private Double longitude;
    private Boolean active;
    private Double estimatedBudget;
    private String bestTravelSeason;
}
