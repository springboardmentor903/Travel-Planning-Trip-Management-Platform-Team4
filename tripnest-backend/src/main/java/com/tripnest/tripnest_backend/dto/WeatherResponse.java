package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeatherResponse {

    private String destinationName;
    private Double temperature;
    private Double feelsLike;
    private Integer humidity;
    private String condition;
    private String description;
    private Double windSpeed;
    private String icon;
}
