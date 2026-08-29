package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.WeatherResponse;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.exception.ExternalServiceException;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Service
public class WeatherService {

    private final DestinationRepository destinationRepository;
    private final RestTemplate restTemplate;

    @Value("${openweather.api.key:${weather.api.key:}}")
    private String apiKey;

    @Value("${openweather.api.url:${weather.api.url:https://api.openweathermap.org/data/2.5/weather}}")
    private String apiUrl;

    public WeatherService(DestinationRepository destinationRepository, @Autowired(required = false) RestTemplate restTemplate) {
        this.destinationRepository = destinationRepository;
        if (restTemplate != null) {
            this.restTemplate = restTemplate;
        } else {
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(5000);
            factory.setReadTimeout(5000);
            this.restTemplate = new RestTemplate(factory);
        }
    }

    @Transactional(readOnly = true)
    public WeatherResponse getWeatherForDestination(Integer destinationId) {
        if (destinationId == null || destinationId <= 0) {
            throw new IllegalArgumentException("Destination ID must be a positive integer");
        }

        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + destinationId));

        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new ExternalServiceException("Weather service API key is not configured on the backend. Please set the WEATHER_API_KEY environment variable.");
        }

        String requestUrl;

        if (destination.getLatitude() != null && destination.getLongitude() != null) {
            requestUrl = UriComponentsBuilder.fromUriString(apiUrl)
                    .queryParam("lat", destination.getLatitude())
                    .queryParam("lon", destination.getLongitude())
                    .queryParam("appid", apiKey)
                    .queryParam("units", "metric")
                    .toUriString();
        } else {
            String queryLocation = (destination.getCity() != null && !destination.getCity().trim().isEmpty())
                    ? destination.getCity()
                    : destination.getName();

            requestUrl = UriComponentsBuilder.fromUriString(apiUrl)
                    .queryParam("q", queryLocation)
                    .queryParam("appid", apiKey)
                    .queryParam("units", "metric")
                    .toUriString();
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(requestUrl, Map.class);

            if (response == null) {
                throw new IllegalArgumentException("Empty response received from OpenWeather API");
            }

            return mapToWeatherResponse(destination.getName(), response);
        } catch (ExternalServiceException ex) {
            throw ex;
        } catch (RestClientException ex) {
            throw new IllegalArgumentException("Unable to fetch weather data from OpenWeather API: " + ex.getMessage(), ex);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Unable to fetch weather data: " + ex.getMessage(), ex);
        }
    }

    @SuppressWarnings("unchecked")
    private WeatherResponse mapToWeatherResponse(String destinationName, Map<String, Object> body) {
        if (body == null) {
            throw new IllegalArgumentException("Empty response received from OpenWeather API");
        }

        Double temp = null;
        Double feelsLike = null;
        Integer humidity = null;
        Double windSpeed = null;
        String condition = "Unknown";
        String description = "No description available";
        String icon = "01d";

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
                if (wMap.get("description") != null) {
                    description = String.valueOf(wMap.get("description"));
                }
                if (wMap.get("icon") != null) {
                    icon = String.valueOf(wMap.get("icon"));
                }
            }
        }

        return new WeatherResponse(
                destinationName,
                destinationName,
                temp != null ? temp : 0.0,
                feelsLike != null ? feelsLike : 0.0,
                humidity != null ? humidity : 0,
                condition,
                description,
                windSpeed != null ? windSpeed : 0.0,
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
