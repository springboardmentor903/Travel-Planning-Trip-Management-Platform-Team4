package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.AdminAnalyticsResponse;
import com.tripnest.tripnest_backend.dto.DestinationAnalytics;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.TripStatus;
import java.time.LocalDate;
import com.tripnest.tripnest_backend.repository.ExpenseRepository;
import com.tripnest.tripnest_backend.repository.NotificationRepository;
import com.tripnest.tripnest_backend.repository.RoleRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private AdminService adminService;

    @Test
    @DisplayName("getAnalytics should aggregate metrics correctly from repositories")
    void testGetAnalyticsSuccess() {
        when(userRepository.count()).thenReturn(125L);

        Trip t1 = new Trip();
        t1.setStatus(TripStatus.ACTIVE);
        t1.setStartDate(LocalDate.now().minusDays(1));
        t1.setEndDate(LocalDate.now().plusDays(3));

        Trip t2 = new Trip();
        t2.setStatus(TripStatus.COMPLETED);
        t2.setStartDate(LocalDate.now().minusDays(10));
        t2.setEndDate(LocalDate.now().minusDays(2));

        when(tripRepository.findAll()).thenReturn(List.of(t1, t2));

        List<DestinationAnalytics> mockDests = List.of(
                new DestinationAnalytics(3, "Bali", 72L),
                new DestinationAnalytics(1, "Paris", 50L),
                new DestinationAnalytics(5, "Dubai", 44L)
        );
        when(tripRepository.findTopPopularDestinations(any(PageRequest.class))).thenReturn(mockDests);
        when(expenseRepository.getTotalExpenses()).thenReturn(new BigDecimal("125430.50"));
        when(notificationRepository.count()).thenReturn(542L);

        AdminAnalyticsResponse response = adminService.getAnalytics();

        assertNotNull(response);
        assertEquals(125L, response.getTotalUsers());

        assertNotNull(response.getTripAnalytics());
        assertEquals(2L, response.getTripAnalytics().getTotalTrips());
        assertEquals(1L, response.getTripAnalytics().getOngoingTrips());
        assertEquals(1L, response.getTripAnalytics().getCompletedTrips());

        assertEquals(3, response.getPopularDestinations().size());
        assertEquals("Bali", response.getPopularDestinations().get(0).getDestinationName());
        assertEquals(72L, response.getPopularDestinations().get(0).getTripCount());

        assertNotNull(response.getPlatformStats());
        assertEquals(new BigDecimal("125430.50"), response.getPlatformStats().getTotalExpenses());
        assertEquals(542L, response.getPlatformStats().getTotalNotifications());
    }

    @Test
    @DisplayName("getAnalytics should handle empty data gracefully returning zeros and empty list")
    void testGetAnalyticsEmptyDatabase() {
        when(userRepository.count()).thenReturn(0L);
        when(tripRepository.findAll()).thenReturn(List.of());
        when(tripRepository.findTopPopularDestinations(any(PageRequest.class))).thenReturn(List.of());
        when(expenseRepository.getTotalExpenses()).thenReturn(null);
        when(notificationRepository.count()).thenReturn(0L);

        AdminAnalyticsResponse response = adminService.getAnalytics();

        assertNotNull(response);
        assertEquals(0L, response.getTotalUsers());
        assertEquals(0L, response.getTripAnalytics().getTotalTrips());
        assertEquals(0L, response.getTripAnalytics().getOngoingTrips());
        assertEquals(0L, response.getTripAnalytics().getCompletedTrips());
        assertTrue(response.getPopularDestinations().isEmpty());
        assertEquals(BigDecimal.ZERO, response.getPlatformStats().getTotalExpenses());
        assertEquals(0L, response.getPlatformStats().getTotalNotifications());
    }
}
