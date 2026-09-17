package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.*;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.TripStatus;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final DestinationRepository destinationRepository;

    public ComprehensiveAnalyticsResponse getComprehensiveAnalytics(String timeRange, LocalDate fromDate, LocalDate toDate) {
        DateBounds bounds = resolveDateBounds(timeRange, fromDate, toDate);

        ComprehensiveAnalyticsResponse.KpiMetrics kpi = buildKpiMetrics(bounds);
        UserAnalyticsDTO userAnalytics = buildUserAnalytics(bounds);
        ComprehensiveAnalyticsResponse.TripAnalyticsSection tripAnalytics = buildTripAnalyticsSection(bounds);
        ComprehensiveAnalyticsResponse.DestinationAnalyticsSection destAnalytics = buildDestinationAnalyticsSection(bounds);
        BudgetAnalyticsDTO budgetAnalytics = buildBudgetAnalytics();
        DateAnalyticsDTO dateAnalytics = buildDateAnalytics();

        return new ComprehensiveAnalyticsResponse(
                kpi,
                userAnalytics,
                tripAnalytics,
                destAnalytics,
                budgetAnalytics,
                dateAnalytics
        );
    }

    public ComprehensiveAnalyticsResponse.KpiMetrics buildKpiMetrics(DateBounds bounds) {
        long totalUsers = userRepository.count();
        long newUsersInPeriod = userRepository.countByCreatedAtBetween(bounds.startDateTime, bounds.endDateTime);
        long activeUsers = userRepository.countByActiveTrue();

        long totalTrips = tripRepository.count();
        long tripsInPeriod = tripRepository.countByCreatedAtBetween(bounds.startDateTime, bounds.endDateTime);

        long totalDestinations = destinationRepository.count();
        long activeDestinations = destinationRepository.countByActiveTrue();

        Double avgBudget = tripRepository.getAverageTripBudget();
        if (avgBudget == null) avgBudget = 0.0;

        return new ComprehensiveAnalyticsResponse.KpiMetrics(
                totalUsers,
                newUsersInPeriod,
                activeUsers,
                totalTrips,
                tripsInPeriod,
                totalDestinations,
                activeDestinations,
                roundTwoDecimals(avgBudget)
        );
    }

    public UserAnalyticsDTO buildUserAnalytics(DateBounds bounds) {
        long totalUsers = userRepository.count();
        long newUsersInPeriod = userRepository.countByCreatedAtBetween(bounds.startDateTime, bounds.endDateTime);
        long activeUsers = userRepository.countByActiveTrue();
        long travelerCount = userRepository.countByRole_Name("TRAVELER");
        long adminCount = userRepository.countByRole_Name("ADMINISTRATOR");

        List<Object[]> rawTrend = null;
        try {
            rawTrend = userRepository.getUserRegistrationTrend(bounds.startDateTime, bounds.endDateTime);
        } catch (Exception ignored) {}
        List<UserTrendDTO> trend = new ArrayList<>();
        if (rawTrend != null) {
            for (Object[] row : rawTrend) {
                String period = row[0] != null ? row[0].toString() : "";
                long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
                trend.add(new UserTrendDTO(period, count));
            }
        }

        return new UserAnalyticsDTO(
                totalUsers,
                newUsersInPeriod,
                activeUsers,
                travelerCount,
                adminCount,
                trend
        );
    }

    public ComprehensiveAnalyticsResponse.TripAnalyticsSection buildTripAnalyticsSection(DateBounds bounds) {
        long totalTrips = tripRepository.count();
        List<Trip> allTrips = tripRepository.findAll();

        LocalDate today = LocalDate.now();
        long upcoming = 0;
        long ongoing = 0;
        long completed = 0;
        long cancelled = 0;

        for (Trip trip : allTrips) {
            if (trip.getStatus() == TripStatus.CANCELLED) {
                cancelled++;
            } else if (trip.getStartDate() != null && trip.getEndDate() != null) {
                if (today.isBefore(trip.getStartDate())) {
                    upcoming++;
                } else if (!today.isBefore(trip.getStartDate()) && !today.isAfter(trip.getEndDate())) {
                    ongoing++;
                } else {
                    completed++;
                }
            } else {
                upcoming++;
            }
        }

        List<Object[]> rawCreationTrend = null;
        try {
            rawCreationTrend = tripRepository.getTripCreationTrend(bounds.startDateTime, bounds.endDateTime);
        } catch (Exception ignored) {}
        List<TripMonthlyCountDTO> tripsOverTime = new ArrayList<>();
        if (rawCreationTrend != null) {
            for (Object[] row : rawCreationTrend) {
                String period = row[0] != null ? row[0].toString() : "";
                long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
                tripsOverTime.add(new TripMonthlyCountDTO(period, count));
            }
        }

        return new ComprehensiveAnalyticsResponse.TripAnalyticsSection(
                totalTrips,
                upcoming,
                ongoing,
                completed,
                cancelled,
                tripsOverTime
        );
    }

    public ComprehensiveAnalyticsResponse.DestinationAnalyticsSection buildDestinationAnalyticsSection(DateBounds bounds) {
        long totalDestinations = destinationRepository.count();
        long activeDestinations = destinationRepository.countByActiveTrue();

        List<DestinationAnalytics> popRaw = tripRepository.findTopPopularDestinations(PageRequest.of(0, 10));
        long totalTripCount = tripRepository.count();

        List<DestinationShareDTO> topDestinations = new ArrayList<>();
        if (popRaw != null && !popRaw.isEmpty()) {
            for (DestinationAnalytics d : popRaw) {
                double pct = totalTripCount > 0 ? (d.getTripCount() * 100.0 / totalTripCount) : 0.0;
                topDestinations.add(new DestinationShareDTO(
                        d.getDestinationId(),
                        d.getDestinationName(),
                        d.getTripCount(),
                        roundTwoDecimals(pct)
                ));
            }
        }

        List<Object[]> categoryRaw = null;
        try {
            categoryRaw = destinationRepository.getCategoryDistribution();
        } catch (Exception ignored) {}
        List<CategoryDistributionDTO> categoryDistribution = new ArrayList<>();
        if (categoryRaw != null && !categoryRaw.isEmpty()) {
            for (Object[] row : categoryRaw) {
                String catName = row[0] != null ? row[0].toString() : "Uncategorized";
                long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
                double pct = totalDestinations > 0 ? (count * 100.0 / totalDestinations) : 0.0;
                categoryDistribution.add(new CategoryDistributionDTO(catName, count, roundTwoDecimals(pct)));
            }
        }

        return new ComprehensiveAnalyticsResponse.DestinationAnalyticsSection(
                totalDestinations,
                activeDestinations,
                topDestinations,
                categoryDistribution
        );
    }

    public BudgetAnalyticsDTO buildBudgetAnalytics() {
        Double avg = tripRepository.getAverageTripBudget();
        Double min = tripRepository.getMinTripBudget();
        Double max = tripRepository.getMaxTripBudget();
        Double total = tripRepository.getTotalPlannedBudget();

        avg = avg != null ? roundTwoDecimals(avg) : 0.0;
        min = min != null ? roundTwoDecimals(min) : 0.0;
        max = max != null ? roundTwoDecimals(max) : 0.0;
        total = total != null ? roundTwoDecimals(total) : 0.0;

        List<Trip> allTrips = tripRepository.findAll();
        long countUnder25k = 0;
        long count25kTo50k = 0;
        long count50kTo100k = 0;
        long countAbove100k = 0;
        long totalWithBudget = 0;

        for (Trip t : allTrips) {
            if (t.getBudget() != null) {
                totalWithBudget++;
                double b = t.getBudget();
                if (b < 25000) {
                    countUnder25k++;
                } else if (b <= 50000) {
                    count25kTo50k++;
                } else if (b <= 100000) {
                    count50kTo100k++;
                } else {
                    countAbove100k++;
                }
            }
        }

        List<BudgetAnalyticsDTO.BudgetRangeBucket> buckets = new ArrayList<>();
        buckets.add(new BudgetAnalyticsDTO.BudgetRangeBucket("< ₹25,000", countUnder25k, calcPct(countUnder25k, totalWithBudget)));
        buckets.add(new BudgetAnalyticsDTO.BudgetRangeBucket("₹25,000 - ₹50,000", count25kTo50k, calcPct(count25kTo50k, totalWithBudget)));
        buckets.add(new BudgetAnalyticsDTO.BudgetRangeBucket("₹50,000 - ₹100,000", count50kTo100k, calcPct(count50kTo100k, totalWithBudget)));
        buckets.add(new BudgetAnalyticsDTO.BudgetRangeBucket("> ₹100,000", countAbove100k, calcPct(countAbove100k, totalWithBudget)));

        return new BudgetAnalyticsDTO(avg, min, max, total, buckets);
    }

    public DateAnalyticsDTO buildDateAnalytics() {
        Double avgDuration = null;
        try {
            avgDuration = tripRepository.getAverageTripDurationDays();
        } catch (Exception ignored) {}
        avgDuration = avgDuration != null ? roundTwoDecimals(avgDuration) : 0.0;

        List<Object[]> rawMonths = null;
        try {
            rawMonths = tripRepository.getPopularTravelMonths();
        } catch (Exception ignored) {}
        List<DateAnalyticsDTO.MonthCountDTO> popularMonths = new ArrayList<>();
        if (rawMonths != null) {
            for (Object[] row : rawMonths) {
                String mName = row[0] != null ? row[0].toString().trim() : "Unknown";
                long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
                popularMonths.add(new DateAnalyticsDTO.MonthCountDTO(mName, count));
            }
        }

        List<Trip> allTrips = tripRepository.findAll();
        LocalDate today = LocalDate.now();
        long upcoming = 0;
        long ongoing = 0;
        long completed = 0;
        long cancelled = 0;

        for (Trip trip : allTrips) {
            if (trip.getStatus() == TripStatus.CANCELLED) {
                cancelled++;
            } else if (trip.getStartDate() != null && trip.getEndDate() != null) {
                if (today.isBefore(trip.getStartDate())) {
                    upcoming++;
                } else if (!today.isBefore(trip.getStartDate()) && !today.isAfter(trip.getEndDate())) {
                    ongoing++;
                } else {
                    completed++;
                }
            } else {
                upcoming++;
            }
        }

        return new DateAnalyticsDTO(avgDuration, popularMonths, upcoming, ongoing, completed, cancelled);
    }

    private DateBounds resolveDateBounds(String timeRange, LocalDate fromDate, LocalDate toDate) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDateTime = toDate != null ? toDate.atTime(LocalTime.MAX) : now;
        LocalDateTime startDateTime;

        if (fromDate != null) {
            startDateTime = fromDate.atStartOfDay();
        } else if (timeRange == null || timeRange.isEmpty() || timeRange.equalsIgnoreCase("30d")) {
            startDateTime = now.minusDays(30);
        } else if (timeRange.equalsIgnoreCase("7d")) {
            startDateTime = now.minusDays(7);
        } else if (timeRange.equalsIgnoreCase("3m")) {
            startDateTime = now.minusMonths(3);
        } else if (timeRange.equalsIgnoreCase("6m")) {
            startDateTime = now.minusMonths(6);
        } else if (timeRange.equalsIgnoreCase("1y")) {
            startDateTime = now.minusYears(1);
        } else if (timeRange.equalsIgnoreCase("all")) {
            startDateTime = LocalDateTime.of(2000, 1, 1, 0, 0);
        } else {
            startDateTime = now.minusDays(30);
        }

        return new DateBounds(startDateTime, endDateTime);
    }

    private double roundTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private double calcPct(long part, long total) {
        if (total == 0) return 0.0;
        return roundTwoDecimals(part * 100.0 / total);
    }

    private static class DateBounds {
        final LocalDateTime startDateTime;
        final LocalDateTime endDateTime;

        DateBounds(LocalDateTime startDateTime, LocalDateTime endDateTime) {
            this.startDateTime = startDateTime;
            this.endDateTime = endDateTime;
        }
    }
}
