package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.dto.DestinationAnalyticsResponse;
import com.tripnest.tripnest_backend.dto.DestinationVisitStatsResponse;
import com.tripnest.tripnest_backend.dto.ExpenseCategorySummary;
import com.tripnest.tripnest_backend.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DashboardRepositoryTest {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    private User userA;
    private User userB;
    private Destination destParis;
    private Destination destTokyo;
    private Destination destLondon;

    @BeforeEach
    void setUp() {
        expenseRepository.deleteAll();
        tripRepository.deleteAll();
        userRepository.deleteAll();
        destinationRepository.deleteAll();

        Role role = roleRepository.findByName("TRAVELER").orElseGet(() -> {
            Role r = new Role();
            r.setName("TRAVELER");
            return roleRepository.save(r);
        });

        userA = new User();
        userA.setName("User A");
        userA.setEmail("usera@example.com");
        userA.setPasswordHash("hashed_pwd_a");
        userA.setRole(role);
        userA = userRepository.save(userA);

        userB = new User();
        userB.setName("User B");
        userB.setEmail("userb@example.com");
        userB.setPasswordHash("hashed_pwd_b");
        userB.setRole(role);
        userB = userRepository.save(userB);

        destParis = new Destination(null, "Paris", "France", "Paris", "Desc", "img", "Category");
        destParis = destinationRepository.save(destParis);

        destTokyo = new Destination(null, "Tokyo", "Japan", "Tokyo", "Desc", "img", "Category");
        destTokyo = destinationRepository.save(destTokyo);

        destLondon = new Destination(null, "London", "UK", "London", "Desc", "img", "Category");
        destLondon = destinationRepository.save(destLondon);
    }

    @Test
    void testUpcomingTrips_SortedAndFiltered() {
        LocalDate today = LocalDate.now();

        // Upcoming trip 1 (in 10 days)
        Trip t1 = new Trip(null, "Trip Future Soon", userA, destParis, today.plusDays(10), today.plusDays(15), 1000.0, "notes", null);
        // Upcoming trip 2 (in 30 days)
        Trip t2 = new Trip(null, "Trip Future Later", userA, destTokyo, today.plusDays(30), today.plusDays(40), 2000.0, "notes", null);
        // Active trip (ongoing)
        Trip t3 = new Trip(null, "Trip Active", userA, destLondon, today.minusDays(2), today.plusDays(2), 500.0, "notes", null);
        // Past trip
        Trip t4 = new Trip(null, "Trip Past", userA, destParis, today.minusDays(20), today.minusDays(10), 800.0, "notes", null);
        // User B's upcoming trip (should not appear for user A)
        Trip t5 = new Trip(null, "User B Trip", userB, destParis, today.plusDays(5), today.plusDays(10), 1200.0, "notes", null);

        tripRepository.saveAll(List.of(t1, t2, t3, t4, t5));

        List<Trip> upcoming = tripRepository.findUpcomingTripsByUserId(userA.getId(), today);

        assertEquals(2, upcoming.size());
        assertEquals("Trip Future Soon", upcoming.get(0).getTitle());
        assertEquals("Trip Future Later", upcoming.get(1).getTitle());
    }

    @Test
    void testUserTripAggregations_BudgetAndCounts() {
        LocalDate today = LocalDate.now();

        Trip t1 = new Trip(null, "Trip 1", userA, destParis, today.plusDays(5), today.plusDays(10), 1000.0, "notes", null);
        Trip t2 = new Trip(null, "Trip 2", userA, destParis, today.minusDays(15), today.minusDays(10), 1500.0, "notes", null);
        Trip t3 = new Trip(null, "Trip 3", userA, destTokyo, today.minusDays(5), today.plusDays(2), 2000.0, "notes", null);

        tripRepository.saveAll(List.of(t1, t2, t3));

        Double sumBudget = tripRepository.sumBudgetByUserId(userA.getId());
        assertEquals(4500.0, sumBudget);

        Long totalTrips = tripRepository.countTripsByUserId(userA.getId());
        assertEquals(3L, totalTrips);

        Long uniqueDestinations = tripRepository.countDistinctDestinationsByUserId(userA.getId());
        assertEquals(2L, uniqueDestinations);

        List<DestinationVisitStatsResponse> mostVisited = tripRepository.findMostVisitedDestinationsByUserId(userA.getId());
        assertEquals(2, mostVisited.size());
        assertEquals("Paris", mostVisited.get(0).getDestination());
        assertEquals(2L, mostVisited.get(0).getVisitCount());
        assertEquals("Tokyo", mostVisited.get(1).getDestination());
        assertEquals(1L, mostVisited.get(1).getVisitCount());
    }

    @Test
    void testUserExpensesAggregations() {
        LocalDate today = LocalDate.now();

        Trip t1 = new Trip(null, "Trip 1", userA, destParis, today.plusDays(5), today.plusDays(10), 1000.0, "notes", null);
        Trip t2 = new Trip(null, "Trip 2", userA, destTokyo, today.plusDays(15), today.plusDays(20), 2000.0, "notes", null);
        Trip tUserB = new Trip(null, "User B Trip", userB, destLondon, today.plusDays(5), today.plusDays(10), 1000.0, "notes", null);

        tripRepository.saveAll(List.of(t1, t2, tUserB));

        Expense e1 = new Expense(null, t1, null, userA, ExpenseCategory.FOOD, new BigDecimal("150.00"), today, null, null);
        Expense e2 = new Expense(null, t1, null, userA, ExpenseCategory.TRANSPORTATION, new BigDecimal("350.00"), today, null, null);
        Expense e3 = new Expense(null, t2, null, userA, ExpenseCategory.FOOD, new BigDecimal("200.00"), today, null, null);
        Expense eUserB = new Expense(null, tUserB, null, userB, ExpenseCategory.HOTEL, new BigDecimal("800.00"), today, null, null);

        expenseRepository.saveAll(List.of(e1, e2, e3, eUserB));

        BigDecimal totalUserAExpenses = expenseRepository.findTotalExpensesByUserId(userA.getId());
        assertEquals(new BigDecimal("700.00"), totalUserAExpenses);

        List<ExpenseCategorySummary> summaries = expenseRepository.findCategorySummariesByUserId(userA.getId());
        assertEquals(2, summaries.size());

        BigDecimal totalPlatformExpenses = expenseRepository.findTotalPlatformExpenses();
        assertEquals(new BigDecimal("1500.00"), totalPlatformExpenses);
    }

    @Test
    void testAdminTripAnalytics() {
        LocalDate today = LocalDate.now();

        Trip activeTrip = new Trip(null, "Active", userA, destParis, today.minusDays(1), today.plusDays(3), 1000.0, "notes", null);
        Trip completedTrip1 = new Trip(null, "Completed 1", userA, destParis, today.minusDays(10), today.minusDays(5), 1000.0, "notes", null);
        Trip completedTrip2 = new Trip(null, "Completed 2", userB, destLondon, today.minusDays(20), today.minusDays(15), 1000.0, "notes", null);
        Trip upcomingTrip = new Trip(null, "Upcoming", userB, destParis, today.plusDays(5), today.plusDays(10), 1000.0, "notes", null);

        tripRepository.saveAll(List.of(activeTrip, completedTrip1, completedTrip2, upcomingTrip));

        Long activeCount = tripRepository.countActiveTrips(today);
        assertEquals(1L, activeCount);

        Long completedCount = tripRepository.countCompletedTrips(today);
        assertEquals(2L, completedCount);

        List<DestinationAnalyticsResponse> destinationAnalytics = tripRepository.findPopularDestinationAnalytics();
        assertEquals(2, destinationAnalytics.size());
        assertEquals("Paris", destinationAnalytics.get(0).getDestination());
        assertEquals(3L, destinationAnalytics.get(0).getTripCount());
        assertEquals("London", destinationAnalytics.get(1).getDestination());
        assertEquals(1L, destinationAnalytics.get(1).getTripCount());
    }
}