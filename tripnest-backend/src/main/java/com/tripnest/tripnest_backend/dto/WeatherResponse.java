package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeatherResponse {

    private String location;
    private Double temperature;
    private Double feelsLike;
    private String condition;
    private Integer humidity;
    private Double windSpeed;
    private String icon;
}
