package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DestinationResponse {

    private Integer id;
    private String name;
    private String country;
    private String city;
    private String description;
    private String imageUrl;
    private String category;
    private Double latitude;
    private Double longitude;

    public DestinationResponse(Integer id, String name, String country, String city, String description, String imageUrl, String category) {
        this.id = id;
        this.name = name;
        this.country = country;
        this.city = city;
        this.description = description;
        this.imageUrl = imageUrl;
        this.category = category;
    }
}
