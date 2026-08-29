package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.ActivityResponse;
import com.tripnest.tripnest_backend.dto.CreateActivityRequest;
import com.tripnest.tripnest_backend.dto.UpdateActivityRequest;
import com.tripnest.tripnest_backend.entity.Activity;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.entity.ItineraryDay;
import com.tripnest.tripnest_backend.entity.Role;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.ActivityRepository;
import com.tripnest.tripnest_backend.repository.ItineraryDayRepository;
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
class ActivityServiceTest {

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private ItineraryDayRepository itineraryDayRepository;

    @InjectMocks
    private ActivityService activityService;

    private ItineraryDay itineraryDay;
    private Activity activity;

    @BeforeEach
    void setUp() {
        Role role = new Role(1, "TRAVELER");
        User user = new User(10, "Test User", "user@example.com", "passwordHash", role, false, LocalDateTime.now());
        Destination destination = new Destination(1, "Paris", "France", "Paris", "City of Light", "http://example.com/paris.jpg", "City");
        Trip trip = new Trip(100, "Paris Trip", user, destination, LocalDate.now().plusDays(1), LocalDate.now().plusDays(10), 1500.0, "Notes", LocalDateTime.now());
        itineraryDay = new ItineraryDay(1, trip, 1, LocalDate.now().plusDays(2), "Day 1 Arrival", "Arrive in Paris");

        LocalDateTime start = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0);
        LocalDateTime end = LocalDateTime.now().plusDays(2).withHour(12).withMinute(0);
        activity = new Activity(10, itineraryDay, "Eiffel Tower Visit", "Tour Eiffel", "Paris", start, end);
    }

    @Test
    void testCreateActivity_Success() {
        LocalDateTime start = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0);
        LocalDateTime end = LocalDateTime.now().plusDays(2).withHour(12).withMinute(0);
        CreateActivityRequest request = new CreateActivityRequest("Eiffel Tower Visit", "Tour Eiffel", "Paris", start, end);

        when(itineraryDayRepository.findByIdAndTripUserEmail(1, "user@example.com")).thenReturn(Optional.of(itineraryDay));
        when(activityRepository.save(any(Activity.class))).thenReturn(activity);

        ActivityResponse response = activityService.createActivity(1, request, "user@example.com");

        assertNotNull(response);
        assertEquals(10, response.getId());
        assertEquals("Eiffel Tower Visit", response.getName());
    }

    @Test
    void testCreateActivity_EndTimeBeforeStartTime_ThrowsException() {
        LocalDateTime start = LocalDateTime.now().plusDays(2).withHour(14).withMinute(0);
        LocalDateTime end = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0);
        CreateActivityRequest request = new CreateActivityRequest("Eiffel Tower Visit", "Tour Eiffel", "Paris", start, end);

        when(itineraryDayRepository.findByIdAndTripUserEmail(1, "user@example.com")).thenReturn(Optional.of(itineraryDay));

        assertThrows(IllegalArgumentException.class, () -> activityService.createActivity(1, request, "user@example.com"));
    }

    @Test
    void testGetActivities_Success() {
        when(itineraryDayRepository.findByIdAndTripUserEmail(1, "user@example.com")).thenReturn(Optional.of(itineraryDay));
        when(activityRepository.findByItineraryDayIdAndItineraryDayTripUserEmailOrderByStartTimeAsc(1, "user@example.com")).thenReturn(List.of(activity));

        List<ActivityResponse> response = activityService.getActivities(1, "user@example.com");

        assertEquals(1, response.size());
        assertEquals("Eiffel Tower Visit", response.get(0).getName());
    }

    @Test
    void testUpdateActivity_Success() {
        LocalDateTime start = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0);
        LocalDateTime end = LocalDateTime.now().plusDays(2).withHour(12).withMinute(0);
        UpdateActivityRequest updateRequest = new UpdateActivityRequest("Updated Activity", "New Description", "Paris", start, end);

        when(activityRepository.findByIdAndItineraryDayIdAndItineraryDayTripUserEmail(10, 1, "user@example.com")).thenReturn(Optional.of(activity));
        when(activityRepository.save(any(Activity.class))).thenReturn(activity);

        ActivityResponse response = activityService.updateActivity(1, 10, updateRequest, "user@example.com");

        assertNotNull(response);
        verify(activityRepository, times(1)).save(any(Activity.class));
    }

    @Test
    void testUpdateActivity_UnauthorizedOrMismatch_ThrowsException() {
        LocalDateTime start = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0);
        LocalDateTime end = LocalDateTime.now().plusDays(2).withHour(12).withMinute(0);
        UpdateActivityRequest updateRequest = new UpdateActivityRequest("Updated Activity", "New Description", "Paris", start, end);

        when(activityRepository.findByIdAndItineraryDayIdAndItineraryDayTripUserEmail(10, 1, "otheruser@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> activityService.updateActivity(1, 10, updateRequest, "otheruser@example.com"));
    }

    @Test
    void testDeleteActivity_Success() {
        when(activityRepository.findByIdAndItineraryDayIdAndItineraryDayTripUserEmail(10, 1, "user@example.com")).thenReturn(Optional.of(activity));

        activityService.deleteActivity(1, 10, "user@example.com");

        verify(activityRepository, times(1)).delete(activity);
    }
}
