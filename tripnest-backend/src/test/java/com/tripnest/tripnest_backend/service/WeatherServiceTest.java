package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.WeatherResponse;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WeatherServiceTest {

    @Mock
    private DestinationRepository destinationRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private WeatherService weatherService;

    private Destination destinationWithCoords;
    private Destination destinationWithCity;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(weatherService, "apiKey", "test_api_key");
        ReflectionTestUtils.setField(weatherService, "apiUrl", "https://api.openweathermap.org/data/2.5/weather");

        destinationWithCoords = new Destination(1, "Paris", "France", "Paris", "City of Light", "http://example.com/paris.jpg", "City", 48.8566, 2.3522);
        destinationWithCity = new Destination(2, "Tokyo", "Japan", "Tokyo", "Metropolis", "http://example.com/tokyo.jpg", "City", null, null);
    }

    @Test
    void testGetWeatherForDestination_WithCoordinates_Success() {
        Map<String, Object> mainMap = Map.of("temp", 22.5, "feels_like", 23.0, "humidity", 65);
        Map<String, Object> weatherObj = Map.of("main", "Clear", "description", "clear sky", "icon", "01d");
        Map<String, Object> windMap = Map.of("speed", 4.1);
        Map<String, Object> apiResponse = Map.of("main", mainMap, "weather", List.of(weatherObj), "wind", windMap);

        when(destinationRepository.findById(1)).thenReturn(Optional.of(destinationWithCoords));
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(apiResponse);

        WeatherResponse response = weatherService.getWeatherForDestination(1);

        assertNotNull(response);
        assertEquals("Paris", response.getDestinationName());

        ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);
        verify(restTemplate).getForObject(urlCaptor.capture(), eq(Map.class));
        assertTrue(urlCaptor.getValue().contains("lat=48.8566"));
        assertTrue(urlCaptor.getValue().contains("lon=2.3522"));
        assertTrue(urlCaptor.getValue().contains("appid=test_api_key"));
    }

    @Test
    void testGetWeatherForDestination_WithCityName_Success() {
        Map<String, Object> mainMap = Map.of("temp", 18.0, "feels_like", 18.0, "humidity", 70);
        Map<String, Object> weatherObj = Map.of("main", "Clouds", "description", "few clouds", "icon", "02d");
        Map<String, Object> windMap = Map.of("speed", 3.0);
        Map<String, Object> apiResponse = Map.of("main", mainMap, "weather", List.of(weatherObj), "wind", windMap);

        when(destinationRepository.findById(2)).thenReturn(Optional.of(destinationWithCity));
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(apiResponse);

        WeatherResponse response = weatherService.getWeatherForDestination(2);

        assertNotNull(response);
        assertEquals("Tokyo", response.getDestinationName());

        ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);
        verify(restTemplate).getForObject(urlCaptor.capture(), eq(Map.class));
        assertTrue(urlCaptor.getValue().contains("q=Tokyo"));
    }

    @Test
    void testCorrectMappingToWeatherResponse() {
        Map<String, Object> mainMap = Map.of("temp", 30.5, "feels_like", 33.2, "humidity", 80);
        Map<String, Object> weatherObj = Map.of("main", "Rain", "description", "heavy intensity rain", "icon", "10d");
        Map<String, Object> windMap = Map.of("speed", 8.5);
        Map<String, Object> apiResponse = Map.of("main", mainMap, "weather", List.of(weatherObj), "wind", windMap);

        when(destinationRepository.findById(1)).thenReturn(Optional.of(destinationWithCoords));
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(apiResponse);

        WeatherResponse response = weatherService.getWeatherForDestination(1);

        assertNotNull(response);
        assertEquals("Paris", response.getDestinationName());
        assertEquals(30.5, response.getTemperature());
        assertEquals(33.2, response.getFeelsLike());
        assertEquals(80, response.getHumidity());
        assertEquals("Rain", response.getCondition());
        assertEquals("heavy intensity rain", response.getDescription());
        assertEquals(8.5, response.getWindSpeed());
        assertEquals("10d", response.getIcon());
    }

    @Test
    void testGetWeatherForDestination_ExternalApiFailure_ThrowsException() {
        when(destinationRepository.findById(1)).thenReturn(Optional.of(destinationWithCoords));
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenThrow(new RestClientException("401 Unauthorized"));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> weatherService.getWeatherForDestination(1));
        assertTrue(exception.getMessage().contains("Unable to fetch weather data"));
    }

    @Test
    void testGetWeatherForDestination_DestinationNotFound_ThrowsException() {
        when(destinationRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> weatherService.getWeatherForDestination(999));
    }

    @Test
    void testGetWeatherForDestination_EmptyApiResponse_ThrowsException() {
        when(destinationRepository.findById(1)).thenReturn(Optional.of(destinationWithCoords));
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () -> weatherService.getWeatherForDestination(1));
    }
}
