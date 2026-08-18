package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.CreateTripRequest;
import com.tripnest.tripnest_backend.dto.DestinationResponse;
import com.tripnest.tripnest_backend.dto.TripResponse;
import com.tripnest.tripnest_backend.dto.UpdateTripRequest;
import com.tripnest.tripnest_backend.exception.GlobalExceptionHandler;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.service.TripService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class TripControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TripService tripService;

    @InjectMocks
    private TripController tripController;

    private Authentication authUserA;
    private Authentication authUserB;
    private DestinationResponse destResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(tripController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        authUserA = new UsernamePasswordAuthenticationToken("usera@example.com", "password");
        authUserB = new UsernamePasswordAuthenticationToken("userb@example.com", "password");
        destResponse = new DestinationResponse(1, "Paris", "France", "Paris", "City of Light", "http://example.com/paris.jpg", "Metropolitan");
    }

    @Test
    void testCreateTrip_Success() throws Exception {
        LocalDate startDate = LocalDate.now().plusDays(5);
        LocalDate endDate = LocalDate.now().plusDays(10);

        TripResponse tripResponse = new TripResponse(
                1, "Trip to Paris", 10, "usera@example.com",
                destResponse, startDate, endDate,
                2000.0, "Vacation", LocalDateTime.now()
        );

        when(tripService.createTrip(any(CreateTripRequest.class), eq("usera@example.com"))).thenReturn(tripResponse);

        String jsonPayload = """
                {
                    "title": "Trip to Paris",
                    "destinationId": 1,
                    "startDate": "%s",
                    "endDate": "%s",
                    "budget": 2000.0,
                    "notes": "Vacation"
                }
                """.formatted(startDate, endDate);

        mockMvc.perform(post("/api/trips")
                        .principal(authUserA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Trip to Paris"))
                .andExpect(jsonPath("$.userEmail").value("usera@example.com"));
    }

    @Test
    void testGetTripById_UserA_Success() throws Exception {
        TripResponse tripA = new TripResponse(
                1, "User A Trip", 10, "usera@example.com",
                destResponse, LocalDate.now().plusDays(1), LocalDate.now().plusDays(5),
                1000.0, "Notes", LocalDateTime.now()
        );

        when(tripService.getTripById(1, "usera@example.com")).thenReturn(tripA);

        mockMvc.perform(get("/api/trips/1").principal(authUserA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("User A Trip"));
    }

    @Test
    void testGetTripById_UserB_ForbiddenOrNotFound() throws Exception {
        when(tripService.getTripById(1, "userb@example.com"))
                .thenThrow(new ResourceNotFoundException("Trip not found with id: 1"));

        mockMvc.perform(get("/api/trips/1").principal(authUserB))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Trip not found with id: 1"));
    }

    @Test
    void testUpdateTrip_UserA_Success() throws Exception {
        LocalDate startDate = LocalDate.now().plusDays(2);
        LocalDate endDate = LocalDate.now().plusDays(7);

        TripResponse updatedResponse = new TripResponse(
                1, "Updated Trip Title", 10, "usera@example.com",
                destResponse, startDate, endDate,
                3000.0, "Updated Notes", LocalDateTime.now()
        );

        when(tripService.updateTrip(eq(1), any(UpdateTripRequest.class), eq("usera@example.com"))).thenReturn(updatedResponse);

        String jsonPayload = """
                {
                    "title": "Updated Trip Title",
                    "destinationId": 1,
                    "startDate": "%s",
                    "endDate": "%s",
                    "budget": 3000.0,
                    "notes": "Updated Notes"
                }
                """.formatted(startDate, endDate);

        mockMvc.perform(put("/api/trips/1")
                        .principal(authUserA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Trip Title"))
                .andExpect(jsonPath("$.budget").value(3000.0));
    }

    @Test
    void testUpdateTrip_UserB_ForbiddenOrNotFound() throws Exception {
        LocalDate startDate = LocalDate.now().plusDays(2);
        LocalDate endDate = LocalDate.now().plusDays(7);

        when(tripService.updateTrip(eq(1), any(UpdateTripRequest.class), eq("userb@example.com")))
                .thenThrow(new ResourceNotFoundException("Trip not found with id: 1"));

        String jsonPayload = """
                {
                    "title": "Unauthorized Update",
                    "destinationId": 1,
                    "startDate": "%s",
                    "endDate": "%s",
                    "budget": 3000.0,
                    "notes": "Hacked"
                }
                """.formatted(startDate, endDate);

        mockMvc.perform(put("/api/trips/1")
                        .principal(authUserB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Trip not found with id: 1"));
    }

    @Test
    void testDeleteTrip_UserA_Success() throws Exception {
        doNothing().when(tripService).deleteTrip(1, "usera@example.com");

        mockMvc.perform(delete("/api/trips/1").principal(authUserA))
                .andExpect(status().isNoContent());
    }

    @Test
    void testDeleteTrip_UserB_ForbiddenOrNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Trip not found with id: 1"))
                .when(tripService).deleteTrip(1, "userb@example.com");

        mockMvc.perform(delete("/api/trips/1").principal(authUserB))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Trip not found with id: 1"));
    }
}
