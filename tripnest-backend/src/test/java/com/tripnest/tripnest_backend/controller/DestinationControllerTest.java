package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.DestinationResponse;
import com.tripnest.tripnest_backend.dto.WeatherResponse;
import com.tripnest.tripnest_backend.exception.GlobalExceptionHandler;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.service.DestinationService;
import com.tripnest.tripnest_backend.service.WeatherService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DestinationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DestinationService destinationService;

    @Mock
    private WeatherService weatherService;

    @InjectMocks
    private DestinationController destinationController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(destinationController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void testGetAllDestinations() throws Exception {
        DestinationResponse d1 = new DestinationResponse(1, "Paris", "France", "Paris", "City of Light", "http://example.com/paris.jpg", "Metropolitan");
        DestinationResponse d2 = new DestinationResponse(2, "Tokyo", "Japan", "Tokyo", "Metropolis of Japan", "http://example.com/tokyo.jpg", "Metropolitan");

        when(destinationService.getAllDestinations()).thenReturn(List.of(d1, d2));

        mockMvc.perform(get("/api/destinations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Paris"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].name").value("Tokyo"));
    }

    @Test
    void testGetPopularDestinations() throws Exception {
        DestinationResponse d1 = new DestinationResponse(1, "Paris", "France", "Paris", "City of Light", "http://example.com/paris.jpg", "Metropolitan");
        DestinationResponse d2 = new DestinationResponse(2, "Tokyo", "Japan", "Tokyo", "Metropolis of Japan", "http://example.com/tokyo.jpg", "Metropolitan");

        when(destinationService.getPopularDestinations()).thenReturn(List.of(d1, d2));

        mockMvc.perform(get("/api/destinations/popular"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Paris"));
    }

    @Test
    void testGetDestinationById_ValidId() throws Exception {
        DestinationResponse d1 = new DestinationResponse(1, "Paris", "France", "Paris", "City of Light", "http://example.com/paris.jpg", "Metropolitan");

        when(destinationService.getDestinationById(1)).thenReturn(d1);

        mockMvc.perform(get("/api/destinations/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Paris"))
                .andExpect(jsonPath("$.country").value("France"));
    }

    @Test
    void testGetDestinationById_NotFound() throws Exception {
        when(destinationService.getDestinationById(999))
                .thenThrow(new ResourceNotFoundException("Destination not found with id: 999"));

        mockMvc.perform(get("/api/destinations/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Destination not found with id: 999"));
    }

    @Test
    void testGetDestinationById_InvalidType() throws Exception {
        mockMvc.perform(get("/api/destinations/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void testGetDestinationWeather_Success() throws Exception {
        WeatherResponse weather = new WeatherResponse("Paris", 22.5, 23.0, 65, "Clear", "clear sky", 4.1, "01d");

        when(weatherService.getWeatherForDestination(1)).thenReturn(weather);

        mockMvc.perform(get("/api/destinations/1/weather"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.destinationName").value("Paris"))
                .andExpect(jsonPath("$.temperature").value(22.5))
                .andExpect(jsonPath("$.condition").value("Clear"));
    }

    @Test
    void testGetDestinationWeather_NotFound() throws Exception {
        when(weatherService.getWeatherForDestination(999))
                .thenThrow(new ResourceNotFoundException("Destination not found with id: 999"));

        mockMvc.perform(get("/api/destinations/999/weather"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Destination not found with id: 999"));
    }

    @Test
    void testGetDestinationWeather_ServiceFailure() throws Exception {
        when(weatherService.getWeatherForDestination(1))
                .thenThrow(new IllegalArgumentException("Unable to fetch weather data from OpenWeather API"));

        mockMvc.perform(get("/api/destinations/1/weather"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Unable to fetch weather data from OpenWeather API"));
    }
}
