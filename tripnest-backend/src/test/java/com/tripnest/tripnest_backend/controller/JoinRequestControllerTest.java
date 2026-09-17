package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.JoinRequestResponse;
import com.tripnest.tripnest_backend.dto.TripSearchResponse;
import com.tripnest.tripnest_backend.entity.JoinRequestStatus;
import com.tripnest.tripnest_backend.exception.GlobalExceptionHandler;

import com.tripnest.tripnest_backend.service.JoinRequestService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class JoinRequestControllerTest {

    private MockMvc mockMvc;

    @Mock
    private JoinRequestService joinRequestService;

    @InjectMocks
    private JoinRequestController joinRequestController;

    private UsernamePasswordAuthenticationToken authUser;
    private JoinRequestResponse responseDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(joinRequestController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        authUser = new UsernamePasswordAuthenticationToken("user@example.com", null, List.of());
        responseDTO = new JoinRequestResponse(100, 10, "Goa Friends Trip", 2, "Alex", "alex@example.com", JoinRequestStatus.PENDING, LocalDateTime.now(), null, null, null);
    }

    @Test
    void testSearchTrips() throws Exception {
        TripSearchResponse searchResponse = new TripSearchResponse(10, "Goa Friends Trip", "Goa", "India", LocalDate.now(), LocalDate.now().plusDays(5), 1, "Owner");
        when(joinRequestService.searchTripsByName("Goa")).thenReturn(List.of(searchResponse));

        mockMvc.perform(get("/api/trips/search")
                        .param("name", "Goa"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Goa Friends Trip"));
    }

    @Test
    void testCreateJoinRequest() throws Exception {
        when(joinRequestService.createJoinRequest(10, "user@example.com")).thenReturn(responseDTO);

        mockMvc.perform(post("/api/trips/10/join-requests")
                        .principal(authUser))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.requestId").value(100))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void testGetPendingJoinRequests() throws Exception {
        when(joinRequestService.getPendingJoinRequests(10, "user@example.com")).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/trips/10/join-requests")
                        .principal(authUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].requestId").value(100));
    }

    @Test
    void testApproveJoinRequest() throws Exception {
        responseDTO.setStatus(JoinRequestStatus.APPROVED);
        when(joinRequestService.approveJoinRequest(10, 100, "user@example.com")).thenReturn(responseDTO);

        mockMvc.perform(patch("/api/trips/10/join-requests/100/approve")
                        .principal(authUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void testRejectJoinRequest() throws Exception {
        responseDTO.setStatus(JoinRequestStatus.REJECTED);
        when(joinRequestService.rejectJoinRequest(10, 100, "user@example.com")).thenReturn(responseDTO);

        mockMvc.perform(patch("/api/trips/10/join-requests/100/reject")
                        .principal(authUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    void testCancelJoinRequest() throws Exception {
        doNothing().when(joinRequestService).cancelJoinRequest(10, 100, "user@example.com");

        mockMvc.perform(delete("/api/trips/10/join-requests/100")
                        .principal(authUser))
                .andExpect(status().isNoContent());
    }
}
