package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.WeatherResponse;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WeatherService {

    private final DestinationRepository destinationRepository;
    private final RestTemplate restTemplate;

    @Value("${openweather.api.key}")
    private String apiKey;

    @Value("${openweather.api.url:https://api.openweathermap.org/data/2.5/weather}")
    private String apiUrl;

    @Transactional(readOnly = true)
    public WeatherResponse getWeatherForDestination(Integer destinationId) {
        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + destinationId));

        String requestUrl;

        if (destination.getLatitude() != null && destination.getLongitude() != null) {
            requestUrl = UriComponentsBuilder.fromUriString(apiUrl)
                    .queryParam("lat", destination.getLatitude())
                    .queryParam("lon", destination.getLongitude())
                    .queryParam("appid", apiKey)
                    .queryParam("units", "metric")
                    .toUriString();
        } else {
            String queryLocation = (destination.getCity() != null && !destination.getCity().isBlank())
                    ? destination.getCity()
                    : destination.getName();

            requestUrl = UriComponentsBuilder.fromUriString(apiUrl)
                    .queryParam("q", queryLocation)
                    .queryParam("appid", apiKey)
                    .queryParam("units", "metric")
                    .toUriString();
        }

        try {
            Map<String, Object> response = restTemplate.getForObject(requestUrl, Map.class);
            return mapToWeatherResponse(destination.getName(), response);
        } catch (RestClientException ex) {
            throw new IllegalArgumentException("Unable to fetch weather data from OpenWeather API: " + ex.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private WeatherResponse mapToWeatherResponse(String destinationName, Map<String, Object> apiResponse) {
        if (apiResponse == null) {
            throw new IllegalArgumentException("Empty response received from OpenWeather API");
        }

        Map<String, Object> mainMap = (Map<String, Object>) apiResponse.get("main");
        Map<String, Object> windMap = (Map<String, Object>) apiResponse.get("wind");
        List<Map<String, Object>> weatherList = (List<Map<String, Object>>) apiResponse.get("weather");

        Double temp = mainMap != null && mainMap.get("temp") != null ? ((Number) mainMap.get("temp")).doubleValue() : 0.0;
        Double feelsLike = mainMap != null && mainMap.get("feels_like") != null ? ((Number) mainMap.get("feels_like")).doubleValue() : 0.0;
        Integer humidity = mainMap != null && mainMap.get("humidity") != null ? ((Number) mainMap.get("humidity")).intValue() : 0;

        String condition = "Unknown";
        String description = "No description available";
        String icon = "01d";

        if (weatherList != null && !weatherList.isEmpty()) {
            Map<String, Object> weather = weatherList.get(0);
            condition = (String) weather.getOrDefault("main", "Unknown");
            description = (String) weather.getOrDefault("description", "No description available");
            icon = (String) weather.getOrDefault("icon", "01d");
        }

        Double windSpeed = windMap != null && windMap.get("speed") != null ? ((Number) windMap.get("speed")).doubleValue() : 0.0;

        return new WeatherResponse(
                destinationName,
                temp,
                feelsLike,
                humidity,
                condition,
                description,
                windSpeed,
                icon
        );
    }
}
