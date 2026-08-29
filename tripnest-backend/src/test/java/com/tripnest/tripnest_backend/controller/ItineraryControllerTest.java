package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.CreateItineraryDayRequest;
import com.tripnest.tripnest_backend.dto.ItineraryDayResponse;
import com.tripnest.tripnest_backend.dto.UpdateItineraryDayRequest;
import com.tripnest.tripnest_backend.exception.GlobalExceptionHandler;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.service.ItineraryService;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ItineraryControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ItineraryService itineraryService;

    @InjectMocks
    private ItineraryController itineraryController;

    private Authentication authUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(itineraryController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        authUser = new UsernamePasswordAuthenticationToken("user@example.com", "password");
    }

    @Test
    void testCreateItineraryDay_Success() throws Exception {
        ItineraryDayResponse response = new ItineraryDayResponse(1, 100, 1, LocalDate.now().plusDays(2), "Day 1 Arrival", "Arrive in Paris");
        when(itineraryService.createItineraryDay(eq(100), any(CreateItineraryDayRequest.class), eq("user@example.com"))).thenReturn(response);

        String jsonPayload = """
                {
                    "dayNumber": 1,
                    "date": "%s",
                    "title": "Day 1 Arrival",
                    "description": "Arrive in Paris"
                }
                """.formatted(LocalDate.now().plusDays(2));

        mockMvc.perform(post("/api/trips/100/itineraries")
                        .principal(authUser)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.dayNumber").value(1))
                .andExpect(jsonPath("$.title").value("Day 1 Arrival"));
    }

    @Test
    void testGetItineraryDays_Success() throws Exception {
        ItineraryDayResponse response = new ItineraryDayResponse(1, 100, 1, LocalDate.now().plusDays(2), "Day 1 Arrival", "Arrive in Paris");
        when(itineraryService.getItineraryDays(100, "user@example.com")).thenReturn(List.of(response));

        mockMvc.perform(get("/api/trips/100/itineraries").principal(authUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Day 1 Arrival"));
    }

    @Test
    void testGetItineraryDay_Success() throws Exception {
        ItineraryDayResponse response = new ItineraryDayResponse(1, 100, 1, LocalDate.now().plusDays(2), "Day 1 Arrival", "Arrive in Paris");
        when(itineraryService.getItineraryDay(1, "user@example.com")).thenReturn(response);

        mockMvc.perform(get("/api/itineraries/1").principal(authUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Day 1 Arrival"));
    }

    @Test
    void testUpdateItineraryDay_Success() throws Exception {
        ItineraryDayResponse response = new ItineraryDayResponse(1, 100, 1, LocalDate.now().plusDays(2), "Updated Day Title", "Updated Description");
        when(itineraryService.updateItineraryDay(eq(1), any(UpdateItineraryDayRequest.class), eq("user@example.com"))).thenReturn(response);

        String jsonPayload = """
                {
                    "dayNumber": 1,
                    "date": "%s",
                    "title": "Updated Day Title",
                    "description": "Updated Description"
                }
                """.formatted(LocalDate.now().plusDays(2));

        mockMvc.perform(put("/api/itineraries/1")
                        .principal(authUser)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Day Title"));
    }

    @Test
    void testDeleteItineraryDay_Success() throws Exception {
        doNothing().when(itineraryService).deleteItineraryDay(1, "user@example.com");

        mockMvc.perform(delete("/api/itineraries/1").principal(authUser))
                .andExpect(status().isNoContent());
    }
}
