package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.*;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.entity.ExpenseCategory;
import com.tripnest.tripnest_backend.entity.Role;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.ExpenseRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private TripService tripService;

    @Mock
    private ExpenseService expenseService;

    @InjectMocks
    private DashboardService dashboardService;

    private User user;
    private Destination destinationParis;
    private Destination destinationTokyo;
    private Trip tripUpcoming;
    private TripResponse tripResponse;

    @BeforeEach
    void setUp() {
        Role role = new Role(1, "TRAVELER");
        user = new User(10, "John Doe", "john@example.com", "hash", role, false, LocalDateTime.now());

        destinationParis = new Destination(1, "Paris", "France", "Paris", "City of Light", "http://example.com/paris.jpg", "Metropolitan");
        destinationTokyo = new Destination(2, "Tokyo", "Japan", "Tokyo", "Metropolis", "http://example.com/tokyo.jpg", "Metropolitan");

        tripUpcoming = new Trip(100, "Paris Holiday", user, destinationParis,
                LocalDate.now().plusDays(10), LocalDate.now().plusDays(20),
                3000.0, "Vacation", LocalDateTime.now());

        DestinationResponse destResp = new DestinationResponse(
                1, "Paris", "France", "Paris", "City of Light", "http://example.com/paris.jpg", "Metropolitan"
        );
        tripResponse = new TripResponse(
                100, "Paris Holiday", 10, "john@example.com",
                destResp, LocalDate.now().plusDays(10), LocalDate.now().plusDays(20),
                3000.0, "Vacation", LocalDateTime.now()
        );
    }

    @Test
    void testGetTravelerDashboard_Success() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(tripRepository.findUpcomingTripsByUserId(eq(10), any(LocalDate.class)))
                .thenReturn(List.of(tripUpcoming));
        when(tripService.mapToResponse(tripUpcoming)).thenReturn(tripResponse);
        when(tripRepository.sumBudgetByUserId(10)).thenReturn(4500.0);
        when(expenseRepository.findTotalExpensesByUserId(10)).thenReturn(new BigDecimal("1250.50"));

        List<CategorySummaryResponse> categorySummaries = List.of(
                new CategorySummaryResponse(ExpenseCategory.FOOD, new BigDecimal("450.00")),
                new CategorySummaryResponse(ExpenseCategory.TRANSPORTATION, new BigDecimal("800.50"))
        );
        when(expenseService.getCategorySummaryForUser(10)).thenReturn(categorySummaries);

        List<DestinationVisitStatsResponse> destVisits = List.of(
                new DestinationVisitStatsResponse("Paris", 3L),
                new DestinationVisitStatsResponse("Tokyo", 1L)
        );
        when(tripRepository.findMostVisitedDestinationsByUserId(10)).thenReturn(destVisits);
        when(tripRepository.countTripsByUserId(10)).thenReturn(4L);
        when(tripRepository.countDistinctDestinationsByUserId(10)).thenReturn(2L);

        TravelerDashboardResponse response = dashboardService.getTravelerDashboard("john@example.com");

        assertNotNull(response);

        // Upcoming trips
        assertEquals(1, response.getUpcomingTrips().size());
        assertEquals("Paris Holiday", response.getUpcomingTrips().get(0).getTitle());

        // Budget overview
        assertEquals(BigDecimal.valueOf(4500.0), response.getBudgetOverview().getTotalBudgeted());
        assertEquals(new BigDecimal("1250.50"), response.getBudgetOverview().getTotalSpent());

        // Expense summary
        assertEquals(2, response.getExpenseSummary().size());
        assertEquals(ExpenseCategory.FOOD, response.getExpenseSummary().get(0).getCategory());
        assertEquals(new BigDecimal("450.00"), response.getExpenseSummary().get(0).getTotalAmount());

        // Destinations
        assertEquals(2, response.getDestinations().size());
        assertEquals("Paris", response.getDestinations().get(0).getDestination());
        assertEquals(3L, response.getDestinations().get(0).getVisitCount());

        // Travel stats
        assertEquals(4L, response.getTravelStats().getTotalTripsTaken());
        assertEquals(2L, response.getTravelStats().getTotalDestinationsVisited());
        assertEquals(new BigDecimal("1250.50"), response.getTravelStats().getTotalAmountSpent());
        assertEquals(response.getBudgetOverview().getTotalSpent(), response.getTravelStats().getTotalAmountSpent());
    }

    @Test
    void testGetTravelerDashboard_EmptyData() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(tripRepository.findUpcomingTripsByUserId(eq(10), any(LocalDate.class)))
                .thenReturn(Collections.emptyList());
        when(tripRepository.sumBudgetByUserId(10)).thenReturn(null);
        when(expenseRepository.findTotalExpensesByUserId(10)).thenReturn(null);
        when(expenseService.getCategorySummaryForUser(10)).thenReturn(Collections.emptyList());
        when(tripRepository.findMostVisitedDestinationsByUserId(10)).thenReturn(Collections.emptyList());
        when(tripRepository.countTripsByUserId(10)).thenReturn(null);
        when(tripRepository.countDistinctDestinationsByUserId(10)).thenReturn(null);

        TravelerDashboardResponse response = dashboardService.getTravelerDashboard("john@example.com");

        assertNotNull(response);
        assertTrue(response.getUpcomingTrips().isEmpty());
        assertEquals(BigDecimal.ZERO, response.getBudgetOverview().getTotalBudgeted());
        assertEquals(BigDecimal.ZERO, response.getBudgetOverview().getTotalSpent());
        assertTrue(response.getExpenseSummary().isEmpty());
        assertTrue(response.getDestinations().isEmpty());
        assertEquals(0L, response.getTravelStats().getTotalTripsTaken());
        assertEquals(0L, response.getTravelStats().getTotalDestinationsVisited());
        assertEquals(BigDecimal.ZERO, response.getTravelStats().getTotalAmountSpent());
    }

    @Test
    void testGetTravelerDashboard_UserNotFound_ThrowsException() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                dashboardService.getTravelerDashboard("unknown@example.com"));
    }

    @Test
    void testGetAdminDashboard_Success() {
        when(userRepository.count()).thenReturn(150L);
        when(tripRepository.count()).thenReturn(320L);
        when(tripRepository.countActiveTrips(any(LocalDate.class))).thenReturn(45L);
        when(tripRepository.countCompletedTrips(any(LocalDate.class))).thenReturn(210L);

        List<DestinationAnalyticsResponse> popularDestinations = List.of(
                new DestinationAnalyticsResponse("Paris", 120L),
                new DestinationAnalyticsResponse("Tokyo", 95L),
                new DestinationAnalyticsResponse("Bali", 60L)
        );
        when(tripRepository.findPopularDestinationAnalytics()).thenReturn(popularDestinations);
        when(expenseRepository.findTotalPlatformExpenses()).thenReturn(new BigDecimal("98500.75"));

        AdminDashboardResponse response = dashboardService.getAdminDashboard();

        assertNotNull(response);
        assertEquals(150L, response.getUserAnalytics().getTotalUsers());
        assertEquals(320L, response.getTripAnalytics().getTotalTrips());
        assertEquals(45L, response.getTripAnalytics().getActiveTrips());
        assertEquals(210L, response.getTripAnalytics().getCompletedTrips());
        assertEquals(3, response.getDestinationAnalytics().size());
        assertEquals("Paris", response.getDestinationAnalytics().get(0).getDestination());
        assertEquals(120L, response.getDestinationAnalytics().get(0).getTripCount());
        assertEquals(new BigDecimal("98500.75"), response.getPlatformStats().getTotalExpenses());
        assertEquals(0L, response.getPlatformStats().getTotalNotificationsSent());
    }

    @Test
    void testGetAdminDashboard_EmptyDatabase() {
        when(userRepository.count()).thenReturn(0L);
        when(tripRepository.count()).thenReturn(0L);
        when(tripRepository.countActiveTrips(any(LocalDate.class))).thenReturn(null);
        when(tripRepository.countCompletedTrips(any(LocalDate.class))).thenReturn(null);
        when(tripRepository.findPopularDestinationAnalytics()).thenReturn(Collections.emptyList());
        when(expenseRepository.findTotalPlatformExpenses()).thenReturn(null);

        AdminDashboardResponse response = dashboardService.getAdminDashboard();

        assertNotNull(response);
        assertEquals(0L, response.getUserAnalytics().getTotalUsers());
        assertEquals(0L, response.getTripAnalytics().getTotalTrips());
        assertEquals(0L, response.getTripAnalytics().getActiveTrips());
        assertEquals(0L, response.getTripAnalytics().getCompletedTrips());
        assertTrue(response.getDestinationAnalytics().isEmpty());
        assertEquals(BigDecimal.ZERO, response.getPlatformStats().getTotalExpenses());
        assertEquals(0L, response.getPlatformStats().getTotalNotificationsSent());
    }
}