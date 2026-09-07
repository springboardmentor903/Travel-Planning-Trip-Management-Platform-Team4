package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.*;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.ExpenseRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;
    private final TripService tripService;
    private final ExpenseService expenseService;

    @Transactional(readOnly = true)
    public TravelerDashboardResponse getTravelerDashboard(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Integer userId = user.getId();
        LocalDate today = LocalDate.now();

        // 1. Upcoming Trips (startDate > today, sorted startDate ASC)
        List<Trip> upcomingTripEntities = tripRepository.findUpcomingTripsByUserId(userId, today);
        List<TripResponse> upcomingTrips = upcomingTripEntities.stream()
                .map(tripService::mapToResponse)
                .toList();

        // 2. Budget Overview
        Double sumBudget = tripRepository.sumBudgetByUserId(userId);
        BigDecimal totalBudgeted = sumBudget != null ? BigDecimal.valueOf(sumBudget) : BigDecimal.ZERO;

        BigDecimal totalSpent = expenseRepository.findTotalExpensesByUserId(userId);
        if (totalSpent == null) {
            totalSpent = BigDecimal.ZERO;
        }

        BudgetOverviewResponse budgetOverview = new BudgetOverviewResponse(totalBudgeted, totalSpent);

        // 3. Expense Summary (across all trips of authenticated user)
        List<CategorySummaryResponse> expenseSummary = expenseService.getCategorySummaryForUser(userId);

        // 4. Destinations (most visited, grouped by Destination entity)
        List<DestinationVisitStatsResponse> destinations = tripRepository.findMostVisitedDestinationsByUserId(userId);

        // 5. Travel Statistics
        Long totalTripsTaken = tripRepository.countTripsByUserId(userId);
        if (totalTripsTaken == null) {
            totalTripsTaken = 0L;
        }

        Long totalDestinationsVisited = tripRepository.countDistinctDestinationsByUserId(userId);
        if (totalDestinationsVisited == null) {
            totalDestinationsVisited = 0L;
        }

        BigDecimal totalAmountSpent = totalSpent;

        TravelStatsResponse travelStats = new TravelStatsResponse(
                totalTripsTaken,
                totalDestinationsVisited,
                totalAmountSpent
        );

        return new TravelerDashboardResponse(
                upcomingTrips,
                budgetOverview,
                expenseSummary,
                destinations,
                travelStats
        );
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getAdminDashboard() {
        LocalDate today = LocalDate.now();

        // 1. User Analytics
        Long totalUsers = userRepository.count();
        UserAnalyticsResponse userAnalytics = new UserAnalyticsResponse(totalUsers);

        // 2. Trip Analytics
        Long totalTrips = tripRepository.count();
        Long activeTrips = tripRepository.countActiveTrips(today);
        if (activeTrips == null) {
            activeTrips = 0L;
        }
        Long completedTrips = tripRepository.countCompletedTrips(today);
        if (completedTrips == null) {
            completedTrips = 0L;
        }
        TripAnalyticsResponse tripAnalytics = new TripAnalyticsResponse(totalTrips, activeTrips, completedTrips);

        // 3. Destination Analytics
        List<DestinationAnalyticsResponse> destinationAnalytics = tripRepository.findPopularDestinationAnalytics();

        // 4. Platform Statistics
        BigDecimal totalExpenses = expenseRepository.findTotalPlatformExpenses();
        if (totalExpenses == null) {
            totalExpenses = BigDecimal.ZERO;
        }
        Long totalNotificationsSent = 0L;
        PlatformStatsResponse platformStats = new PlatformStatsResponse(totalExpenses, totalNotificationsSent);

        return new AdminDashboardResponse(
                userAnalytics,
                tripAnalytics,
                destinationAnalytics,
                platformStats
        );
    }
}