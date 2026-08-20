package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.WeatherResponse;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.exception.ExternalServiceException;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WeatherService {

    private final DestinationRepository destinationRepository;

    @Value("${weather.api.key:}")
    private String weatherApiKey;

    @Value("${weather.api.url:https://api.openweathermap.org/data/2.5/weather}")
    private String weatherApiUrl;

    public WeatherResponse getWeatherForDestination(Integer destinationId) {
        if (destinationId == null || destinationId <= 0) {
            throw new IllegalArgumentException("Destination ID must be a positive integer");
        }

        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + destinationId));

        if (weatherApiKey == null || weatherApiKey.trim().isEmpty()) {
            throw new ExternalServiceException("Weather service API key is not configured on the backend. Please set the WEATHER_API_KEY environment variable.");
        }

        String locationQuery = destination.getCity() != null && !destination.getCity().trim().isEmpty()
                ? destination.getCity()
                : destination.getName();

        try {
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(5000);
            factory.setReadTimeout(5000);
            RestTemplate restTemplate = new RestTemplate(factory);

            String url = UriComponentsBuilder.fromUriString(weatherApiUrl)
                    .queryParam("q", locationQuery)
                    .queryParam("units", "metric")
                    .queryParam("appid", weatherApiKey)
                    .toUriString();

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null) {
                throw new ExternalServiceException("Received empty response from weather provider");
            }

            return mapToWeatherResponse(locationQuery, response);
        } catch (ExternalServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ExternalServiceException("Unable to fetch live weather data for " + locationQuery + ": " + ex.getMessage(), ex);
        }
    }

    @SuppressWarnings("unchecked")
    private WeatherResponse mapToWeatherResponse(String locationQuery, Map<String, Object> body) {
        Double temp = null;
        Double feelsLike = null;
        Integer humidity = null;
        Double windSpeed = null;
        String condition = "Unknown";
        String icon = null;

        if (body.containsKey("main") && body.get("main") instanceof Map<?, ?> mainMap) {
            temp = getAsDouble(mainMap.get("temp"));
            feelsLike = getAsDouble(mainMap.get("feels_like"));
            humidity = getAsInteger(mainMap.get("humidity"));
        }

        if (body.containsKey("wind") && body.get("wind") instanceof Map<?, ?> windMap) {
            windSpeed = getAsDouble(windMap.get("speed"));
        }

        if (body.containsKey("weather") && body.get("weather") instanceof List<?> weatherList && !weatherList.isEmpty()) {
            if (weatherList.get(0) instanceof Map<?, ?> wMap) {
                if (wMap.get("main") != null) {
                    condition = String.valueOf(wMap.get("main"));
                }
                if (wMap.get("icon") != null) {
                    icon = String.valueOf(wMap.get("icon"));
                }
            }
        }

        return new WeatherResponse(
                locationQuery,
                temp,
                feelsLike,
                condition,
                humidity,
                windSpeed,
                icon
        );
    }

    private Double getAsDouble(Object val) {
        if (val instanceof Number num) {
            return num.doubleValue();
        }
        return null;
    }

    private Integer getAsInteger(Object val) {
        if (val instanceof Number num) {
            return num.intValue();
        }
        return null;
    }
}
