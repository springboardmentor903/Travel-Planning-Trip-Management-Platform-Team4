package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.*;
import com.tripnest.tripnest_backend.entity.ExpenseCategory;
import com.tripnest.tripnest_backend.exception.GlobalExceptionHandler;
import com.tripnest.tripnest_backend.service.DashboardService;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class DashboardControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DashboardService dashboardService;

    @InjectMocks
    private DashboardController dashboardController;

    private Authentication authUser;
    private Authentication authAdmin;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(dashboardController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        authUser = new UsernamePasswordAuthenticationToken("traveler@example.com", "password");
        authAdmin = new UsernamePasswordAuthenticationToken("admin@tripnest.com", "password");
    }

    @Test
    void testGetTravelerDashboard_Success() throws Exception {
        DestinationResponse destResp = new DestinationResponse(
                1, "Paris", "France", "Paris", "City of Light", "http://example.com/paris.jpg", "Metropolitan"
        );
        TripResponse tripResp = new TripResponse(
                1, "Paris Vacation", 10, "traveler@example.com",
                destResp, LocalDate.now().plusDays(5), LocalDate.now().plusDays(10),
                2000.0, "Vacation", LocalDateTime.now()
        );

        TravelerDashboardResponse travelerResponse = new TravelerDashboardResponse(
                List.of(tripResp),
                new BudgetOverviewResponse(new BigDecimal("2000.00"), new BigDecimal("500.00")),
                List.of(new CategorySummaryResponse(ExpenseCategory.FOOD, new BigDecimal("500.00"))),
                List.of(new DestinationVisitStatsResponse("Paris", 1L)),
                new TravelStatsResponse(1L, 1L, new BigDecimal("500.00"))
        );

        when(dashboardService.getTravelerDashboard("traveler@example.com")).thenReturn(travelerResponse);

        mockMvc.perform(get("/api/dashboard/traveler")
                        .principal(authUser)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.upcomingTrips[0].title").value("Paris Vacation"))
                .andExpect(jsonPath("$.budgetOverview.totalBudgeted").value(2000.00))
                .andExpect(jsonPath("$.budgetOverview.totalSpent").value(500.00))
                .andExpect(jsonPath("$.expenseSummary[0].category").value("FOOD"))
                .andExpect(jsonPath("$.expenseSummary[0].totalAmount").value(500.00))
                .andExpect(jsonPath("$.destinations[0].destination").value("Paris"))
                .andExpect(jsonPath("$.destinations[0].visitCount").value(1))
                .andExpect(jsonPath("$.travelStats.totalTripsTaken").value(1))
                .andExpect(jsonPath("$.travelStats.totalDestinationsVisited").value(1))
                .andExpect(jsonPath("$.travelStats.totalAmountSpent").value(500.00));
    }

    @Test
    void testGetAdminDashboard_Success() throws Exception {
        AdminDashboardResponse adminResponse = new AdminDashboardResponse(
                new UserAnalyticsResponse(50L),
                new TripAnalyticsResponse(100L, 20L, 60L),
                List.of(new DestinationAnalyticsResponse("Paris", 45L)),
                new PlatformStatsResponse(new BigDecimal("25000.00"), 0L)
        );

        when(dashboardService.getAdminDashboard()).thenReturn(adminResponse);

        mockMvc.perform(get("/api/dashboard/admin")
                        .principal(authAdmin)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userAnalytics.totalUsers").value(50))
                .andExpect(jsonPath("$.tripAnalytics.totalTrips").value(100))
                .andExpect(jsonPath("$.tripAnalytics.activeTrips").value(20))
                .andExpect(jsonPath("$.tripAnalytics.completedTrips").value(60))
                .andExpect(jsonPath("$.destinationAnalytics[0].destination").value("Paris"))
                .andExpect(jsonPath("$.destinationAnalytics[0].tripCount").value(45))
                .andExpect(jsonPath("$.platformStats.totalExpenses").value(25000.00))
                .andExpect(jsonPath("$.platformStats.totalNotificationsSent").value(0));
    }
}