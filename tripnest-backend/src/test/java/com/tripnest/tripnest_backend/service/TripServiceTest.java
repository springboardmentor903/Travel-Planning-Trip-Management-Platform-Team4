package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.CreateTripRequest;
import com.tripnest.tripnest_backend.dto.TripResponse;
import com.tripnest.tripnest_backend.dto.UpdateTripRequest;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.entity.Role;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
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
class TripServiceTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DestinationRepository destinationRepository;

    @InjectMocks
    private TripService tripService;

    private User userA;
    private Destination destination;

    @BeforeEach
    void setUp() {
        Role role = new Role(1, "TRAVELER");
        userA = new User(10, "User A", "usera@example.com", "hash", role, false, LocalDateTime.now());
        destination = new Destination(1, "Paris", "France", "Paris", "Description", "http://example.com/paris.jpg", "City");
    }

    @Test
    void testCreateTrip_Success() {
        CreateTripRequest request = new CreateTripRequest(
                "Paris Vacation", 1,
                LocalDate.now().plusDays(10), LocalDate.now().plusDays(15),
                1500.0, "Sightseeing"
        );

        when(userRepository.findByEmail("usera@example.com")).thenReturn(Optional.of(userA));
        when(destinationRepository.findById(1)).thenReturn(Optional.of(destination));

        Trip savedTrip = new Trip(
                100, "Paris Vacation", userA, destination,
                request.getStartDate(), request.getEndDate(),
                1500.0, "Sightseeing", LocalDateTime.now()
        );
        when(tripRepository.save(any(Trip.class))).thenReturn(savedTrip);

        TripResponse response = tripService.createTrip(request, "usera@example.com");

        assertNotNull(response);
        assertEquals(100, response.getId());
        assertEquals("Paris Vacation", response.getTitle());
        assertEquals("usera@example.com", response.getUserEmail());
        verify(tripRepository, times(1)).save(any(Trip.class));
    }

    @Test
    void testGetTripById_Success() {
        Trip trip = new Trip(100, "Paris Trip", userA, destination, LocalDate.now().plusDays(1), LocalDate.now().plusDays(5), 1000.0, "Notes", LocalDateTime.now());
        when(tripRepository.findByIdAndUserEmail(100, "usera@example.com")).thenReturn(Optional.of(trip));

        TripResponse response = tripService.getTripById(100, "usera@example.com");

        assertNotNull(response);
        assertEquals(100, response.getId());
        assertEquals("Paris Trip", response.getTitle());
        assertEquals("usera@example.com", response.getUserEmail());
    }

    @Test
    void testGetTripById_NotFoundOrUnauthorized() {
        when(tripRepository.findByIdAndUserEmail(100, "userb@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> tripService.getTripById(100, "userb@example.com"));
    }

    @Test
    void testUpdateTrip_Success() {
        Trip trip = new Trip(100, "Old Title", userA, destination, LocalDate.now().plusDays(1), LocalDate.now().plusDays(5), 1000.0, "Notes", LocalDateTime.now());
        UpdateTripRequest updateRequest = new UpdateTripRequest("Updated Title", 1, LocalDate.now().plusDays(2), LocalDate.now().plusDays(7), 2000.0, "Updated Notes");

        when(tripRepository.findByIdAndUserEmail(100, "usera@example.com")).thenReturn(Optional.of(trip));
        when(destinationRepository.findById(1)).thenReturn(Optional.of(destination));
        when(tripRepository.save(any(Trip.class))).thenReturn(trip);

        TripResponse response = tripService.updateTrip(100, updateRequest, "usera@example.com");

        assertEquals("Updated Title", response.getTitle());
        assertEquals(2000.0, response.getBudget());
    }

    @Test
    void testUpdateTrip_Unauthorized() {
        UpdateTripRequest updateRequest = new UpdateTripRequest("Updated Title", 1, LocalDate.now().plusDays(2), LocalDate.now().plusDays(7), 2000.0, "Updated Notes");
        when(tripRepository.findByIdAndUserEmail(100, "userb@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> tripService.updateTrip(100, updateRequest, "userb@example.com"));
    }

    @Test
    void testDeleteTrip_Success() {
        Trip trip = new Trip(100, "Trip to Delete", userA, destination, LocalDate.now().plusDays(1), LocalDate.now().plusDays(5), 1000.0, "Notes", LocalDateTime.now());
        when(tripRepository.findByIdAndUserEmail(100, "usera@example.com")).thenReturn(Optional.of(trip));

        tripService.deleteTrip(100, "usera@example.com");

        verify(tripRepository, times(1)).delete(trip);
    }

    @Test
    void testDeleteTrip_Unauthorized() {
        when(tripRepository.findByIdAndUserEmail(100, "userb@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> tripService.deleteTrip(100, "userb@example.com"));
        verify(tripRepository, never()).delete(any());
    }
}
