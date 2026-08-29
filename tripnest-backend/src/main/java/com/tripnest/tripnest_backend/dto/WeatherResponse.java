package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeatherResponse {

    private String location;
    private String destinationName;
    private Double temperature;
    private Double feelsLike;
    private Integer humidity;
    private String condition;
    private String description;
    private Double windSpeed;
    private String icon;

    public WeatherResponse(String destinationName, Double temperature, Double feelsLike, String condition, Integer humidity, Double windSpeed, String icon) {
        this.location = destinationName;
        this.destinationName = destinationName;
        this.temperature = temperature;
        this.feelsLike = feelsLike;
        this.condition = condition;
        this.humidity = humidity;
        this.description = condition;
        this.windSpeed = windSpeed;
        this.icon = icon;
    }

    public WeatherResponse(String destinationName, Double temperature, Double feelsLike, Integer humidity, String condition, String description, Double windSpeed, String icon) {
        this.location = destinationName;
        this.destinationName = destinationName;
        this.temperature = temperature;
        this.feelsLike = feelsLike;
        this.humidity = humidity;
        this.condition = condition;
        this.description = description;
        this.windSpeed = windSpeed;
        this.icon = icon;
    }
}
