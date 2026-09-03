package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.CreateItineraryDayRequest;
import com.tripnest.tripnest_backend.dto.ItineraryDayResponse;
import com.tripnest.tripnest_backend.dto.UpdateItineraryDayRequest;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.entity.ItineraryDay;
import com.tripnest.tripnest_backend.entity.Role;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.ItineraryDayRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItineraryServiceTest {

    @Mock
    private ItineraryDayRepository itineraryDayRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TripAccessService tripAccessService;

    @InjectMocks
    private ItineraryService itineraryService;

    private User user;
    private Trip trip;
    private ItineraryDay itineraryDay;

    @BeforeEach
    void setUp() {
        Role role = new Role(1, "TRAVELER");
        user = new User(10, "Test User", "user@example.com", "passwordHash", role, false, LocalDateTime.now());
        Destination destination = new Destination(1, "Paris", "France", "Paris", "City of Light", "http://example.com/paris.jpg", "City");
        trip = new Trip(100, "Paris Trip", user, destination, LocalDate.now().plusDays(1), LocalDate.now().plusDays(10), 1500.0, "Notes", LocalDateTime.now());
        itineraryDay = new ItineraryDay(1, trip, 1, LocalDate.now().plusDays(2), "Day 1 Arrival", "Arrive in Paris");
    }

    @Test
    void testCreateItineraryDay_Success() {
        CreateItineraryDayRequest request = new CreateItineraryDayRequest(1, LocalDate.now().plusDays(2), "Day 1 Arrival", "Arrive in Paris");

        doNothing().when(tripAccessService).validateTripManagement(100, "user@example.com");
        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));
        when(itineraryDayRepository.existsByTripIdAndDayNumber(100, 1)).thenReturn(false);
        when(itineraryDayRepository.save(any(ItineraryDay.class))).thenReturn(itineraryDay);

        ItineraryDayResponse response = itineraryService.createItineraryDay(100, request, "user@example.com");

        assertNotNull(response);
        assertEquals(1, response.getId());
        assertEquals(1, response.getDayNumber());
        assertEquals("Day 1 Arrival", response.getTitle());
    }

    @Test
    void testCreateItineraryDay_NonExistentTrip_ThrowsException() {
        CreateItineraryDayRequest request = new CreateItineraryDayRequest(1, LocalDate.now().plusDays(2), "Day 1 Arrival", "Arrive in Paris");
        doNothing().when(tripAccessService).validateTripManagement(999, "user@example.com");
        when(tripRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> itineraryService.createItineraryDay(999, request, "user@example.com"));
    }

    @Test
    void testCreateItineraryDay_DuplicateDayNumber_ThrowsException() {
        CreateItineraryDayRequest request = new CreateItineraryDayRequest(1, LocalDate.now().plusDays(2), "Day 1 Arrival", "Arrive in Paris");

        doNothing().when(tripAccessService).validateTripManagement(100, "user@example.com");
        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));
        when(itineraryDayRepository.existsByTripIdAndDayNumber(100, 1)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> itineraryService.createItineraryDay(100, request, "user@example.com"));
    }

    @Test
    void testCreateItineraryDay_DateOutOfTripRange_ThrowsException() {
        CreateItineraryDayRequest request = new CreateItineraryDayRequest(1, LocalDate.now().plusDays(20), "Invalid Date Day", "Out of bounds");

        doNothing().when(tripAccessService).validateTripManagement(100, "user@example.com");
        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));
        when(itineraryDayRepository.existsByTripIdAndDayNumber(100, 1)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> itineraryService.createItineraryDay(100, request, "user@example.com"));
    }

    @Test
    void testGetItineraryDays_Success() {
        doNothing().when(tripAccessService).validateTripAccess(100, "user@example.com");
        when(itineraryDayRepository.findByTripIdOrderByDayNumberAsc(100)).thenReturn(List.of(itineraryDay));

        List<ItineraryDayResponse> response = itineraryService.getItineraryDays(100, "user@example.com");

        assertEquals(1, response.size());
        assertEquals("Day 1 Arrival", response.get(0).getTitle());
    }

    @Test
    void testGetItineraryDay_NotFound_ThrowsException() {
        when(itineraryDayRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> itineraryService.getItineraryDay(999, "user@example.com"));
    }

    @Test
    void testUpdateItineraryDay_Success() {
        UpdateItineraryDayRequest updateRequest = new UpdateItineraryDayRequest(1, LocalDate.now().plusDays(3), "Updated Title", "Updated Description");

        when(itineraryDayRepository.findById(1)).thenReturn(Optional.of(itineraryDay));
        doNothing().when(tripAccessService).validateTripManagement(100, "user@example.com");
        when(itineraryDayRepository.save(any(ItineraryDay.class))).thenReturn(itineraryDay);

        ItineraryDayResponse response = itineraryService.updateItineraryDay(1, updateRequest, "user@example.com");

        assertNotNull(response);
        verify(itineraryDayRepository, times(1)).save(any(ItineraryDay.class));
    }

    @Test
    void testDeleteItineraryDay_Success() {
        when(itineraryDayRepository.findById(1)).thenReturn(Optional.of(itineraryDay));
        doNothing().when(tripAccessService).validateTripManagement(100, "user@example.com");

        itineraryService.deleteItineraryDay(1, "user@example.com");

        verify(itineraryDayRepository, times(1)).delete(itineraryDay);
    }
}
