package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.*;
import com.tripnest.tripnest_backend.entity.*;
import com.tripnest.tripnest_backend.repository.TripPackingItemRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PackingChecklistServiceTest {

    @Mock
    private TripPackingItemRepository packingItemRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private WeatherService weatherService;

    @Mock
    private TripAccessService tripAccessService;

    @InjectMocks
    private PackingChecklistService packingChecklistService;

    private User user;
    private Destination destination;
    private Trip trip;

    @BeforeEach
    void setUp() {
        Role role = new Role(1, "TRAVELER");
        user = new User(1, "Traveler", "traveler@example.com", "hash", role, false, true, LocalDateTime.now());
        destination = new Destination(1, "London", "UK", "London", "Capital city", "url", "City", 51.5074, -0.1278, true, 0.0, "All");
        trip = new Trip(10, "London Vacation", user, destination, LocalDate.now().plusDays(2), LocalDate.now().plusDays(8), 2000.0, "Vacation notes", TripStatus.PLANNED, LocalDateTime.now());
    }

    @Test
    @DisplayName("Test Rain & Cold weather rule evaluation")
    void testRainAndColdWeatherPackingRules() {
        // Arrange
        WeatherResponse rainyWeather = new WeatherResponse("London", "London", 12.5, 11.0, 85, "Rain", "Moderate rain", 4.5, "10d");
        when(weatherService.getWeatherForDestination(1)).thenReturn(rainyWeather);
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(packingItemRepository.existsByTripId(10)).thenReturn(false);
        when(packingItemRepository.findByTripId(10)).thenReturn(new ArrayList<>());

        List<TripPackingItem> savedItems = new ArrayList<>();
        when(packingItemRepository.saveAll(any())).thenAnswer(invocation -> {
            List<TripPackingItem> list = invocation.getArgument(0);
            savedItems.addAll(list);
            return list;
        });
        when(packingItemRepository.findByTripIdOrderByCategoryAsc(10)).thenAnswer(i -> savedItems);

        // Act
        PackingChecklistResponse response = packingChecklistService.getOrGeneratePackingChecklist(10, "traveler@example.com");

        // Assert
        assertNotNull(response);
        assertTrue(response.isWeatherAvailable());
        assertEquals("Rain", response.getWeatherCondition());

        boolean hasUmbrella = savedItems.stream().anyMatch(i -> i.getName().toLowerCase().contains("umbrella"));
        boolean hasWarmJacket = savedItems.stream().anyMatch(i -> i.getName().toLowerCase().contains("warm insulated jacket"));

        assertTrue(hasUmbrella, "Should recommend compact umbrella when rain is expected");
        assertTrue(hasWarmJacket, "Should recommend warm jacket when temperature < 15°C");
    }

    @Test
    @DisplayName("Test Hot weather rule evaluation (> 24°C)")
    void testHotWeatherPackingRules() {
        // Arrange
        WeatherResponse hotWeather = new WeatherResponse("Goa", "Goa", 31.0, 33.0, 70, "Clear", "Clear sky", 2.0, "01d");
        when(weatherService.getWeatherForDestination(1)).thenReturn(hotWeather);
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(packingItemRepository.existsByTripId(10)).thenReturn(false);

        List<TripPackingItem> savedItems = new ArrayList<>();
        when(packingItemRepository.saveAll(any())).thenAnswer(invocation -> {
            List<TripPackingItem> list = invocation.getArgument(0);
            savedItems.addAll(list);
            return list;
        });
        when(packingItemRepository.findByTripIdOrderByCategoryAsc(10)).thenAnswer(i -> savedItems);

        // Act
        PackingChecklistResponse response = packingChecklistService.getOrGeneratePackingChecklist(10, "traveler@example.com");

        // Assert
        assertNotNull(response);
        boolean hasSunscreen = savedItems.stream().anyMatch(i -> i.getName().toLowerCase().contains("sunscreen"));
        boolean hasSunglasses = savedItems.stream().anyMatch(i -> i.getName().toLowerCase().contains("sunglasses"));

        assertTrue(hasSunscreen, "Should recommend sunscreen in hot weather (> 24°C)");
        assertTrue(hasSunglasses, "Should recommend sunglasses in hot weather");
    }

    @Test
    @DisplayName("Test Weather Service Failure fallback")
    void testWeatherFailureFallback() {
        // Arrange
        when(weatherService.getWeatherForDestination(1)).thenThrow(new RuntimeException("Weather API offline"));
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(packingItemRepository.existsByTripId(10)).thenReturn(false);

        List<TripPackingItem> savedItems = new ArrayList<>();
        when(packingItemRepository.saveAll(any())).thenAnswer(invocation -> {
            List<TripPackingItem> list = invocation.getArgument(0);
            savedItems.addAll(list);
            return list;
        });
        when(packingItemRepository.findByTripIdOrderByCategoryAsc(10)).thenAnswer(i -> savedItems);

        // Act
        PackingChecklistResponse response = packingChecklistService.getOrGeneratePackingChecklist(10, "traveler@example.com");

        // Assert
        assertNotNull(response);
        assertFalse(response.isWeatherAvailable());
        assertTrue(response.getWeatherSummary().contains("Weather data unavailable"));
        assertFalse(savedItems.isEmpty(), "Fallback should still generate general travel essentials");
    }

    @Test
    @DisplayName("Test Add Custom Packing Item")
    void testAddCustomItem() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(packingItemRepository.save(any(TripPackingItem.class))).thenAnswer(i -> {
            TripPackingItem item = i.getArgument(0);
            item.setId(50);
            return item;
        });

        CreatePackingItemRequest request = new CreatePackingItemRequest("Snorkel Mask", PackingCategory.OTHER, "Scuba diving plan");
        PackingItemDTO dto = packingChecklistService.addCustomItem(10, request, "traveler@example.com");

        assertNotNull(dto);
        assertEquals("Snorkel Mask", dto.getName());
        assertTrue(dto.isCustom());
        assertFalse(dto.isPacked());
    }
}
