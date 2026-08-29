package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.ActivityResponse;
import com.tripnest.tripnest_backend.dto.CreateActivityRequest;
import com.tripnest.tripnest_backend.dto.UpdateActivityRequest;
import com.tripnest.tripnest_backend.exception.GlobalExceptionHandler;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.service.ActivityService;
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

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ActivityControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ActivityService activityService;

    @InjectMocks
    private ActivityController activityController;

    private Authentication authUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(activityController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        authUser = new UsernamePasswordAuthenticationToken("user@example.com", "password");
    }

    @Test
    void testCreateActivity_Success() throws Exception {
        LocalDateTime start = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0);
        LocalDateTime end = LocalDateTime.now().plusDays(2).withHour(12).withMinute(0);

        ActivityResponse response = new ActivityResponse(10, 1, "Eiffel Tower Visit", "Tour Eiffel", "Paris", start, end);
        when(activityService.createActivity(eq(1), any(CreateActivityRequest.class), eq("user@example.com"))).thenReturn(response);

        String jsonPayload = """
                {
                    "name": "Eiffel Tower Visit",
                    "description": "Tour Eiffel",
                    "location": "Paris",
                    "startTime": "%s",
                    "endTime": "%s"
                }
                """.formatted(start, end);

        mockMvc.perform(post("/api/itineraries/1/activities")
                        .principal(authUser)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.name").value("Eiffel Tower Visit"));
    }

    @Test
    void testGetActivities_Success() throws Exception {
        LocalDateTime start = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0);
        LocalDateTime end = LocalDateTime.now().plusDays(2).withHour(12).withMinute(0);

        ActivityResponse response = new ActivityResponse(10, 1, "Eiffel Tower Visit", "Tour Eiffel", "Paris", start, end);
        when(activityService.getActivities(1, "user@example.com")).thenReturn(List.of(response));

        mockMvc.perform(get("/api/itineraries/1/activities").principal(authUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].name").value("Eiffel Tower Visit"));
    }

    @Test
    void testUpdateActivity_Success() throws Exception {
        LocalDateTime start = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0);
        LocalDateTime end = LocalDateTime.now().plusDays(2).withHour(12).withMinute(0);

        ActivityResponse response = new ActivityResponse(10, 1, "Updated Activity", "Updated Description", "Paris", start, end);
        when(activityService.updateActivity(eq(1), eq(10), any(UpdateActivityRequest.class), eq("user@example.com"))).thenReturn(response);

        String jsonPayload = """
                {
                    "name": "Updated Activity",
                    "description": "Updated Description",
                    "location": "Paris",
                    "startTime": "%s",
                    "endTime": "%s"
                }
                """.formatted(start, end);

        mockMvc.perform(put("/api/itineraries/1/activities/10")
                        .principal(authUser)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Activity"));
    }

    @Test
    void testDeleteActivity_Success() throws Exception {
        doNothing().when(activityService).deleteActivity(1, 10, "user@example.com");

        mockMvc.perform(delete("/api/itineraries/1/activities/10").principal(authUser))
                .andExpect(status().isNoContent());
    }
}
