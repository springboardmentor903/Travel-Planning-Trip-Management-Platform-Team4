package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.*;
import com.tripnest.tripnest_backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<ComprehensiveAnalyticsResponse> getAnalytics(
            @RequestParam(value = "timeRange", required = false, defaultValue = "30d") String timeRange,
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        ComprehensiveAnalyticsResponse response = analyticsService.getComprehensiveAnalytics(timeRange, from, to);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/overview")
    public ResponseEntity<ComprehensiveAnalyticsResponse.KpiMetrics> getOverview(
            @RequestParam(value = "timeRange", required = false, defaultValue = "30d") String timeRange,
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        ComprehensiveAnalyticsResponse response = analyticsService.getComprehensiveAnalytics(timeRange, from, to);
        return ResponseEntity.ok(response.getKpi());
    }

    @GetMapping("/users")
    public ResponseEntity<UserAnalyticsDTO> getUserAnalytics(
            @RequestParam(value = "timeRange", required = false, defaultValue = "30d") String timeRange,
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        ComprehensiveAnalyticsResponse response = analyticsService.getComprehensiveAnalytics(timeRange, from, to);
        return ResponseEntity.ok(response.getUserAnalytics());
    }

    @GetMapping("/trips")
    public ResponseEntity<ComprehensiveAnalyticsResponse.TripAnalyticsSection> getTripAnalytics(
            @RequestParam(value = "timeRange", required = false, defaultValue = "30d") String timeRange,
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        ComprehensiveAnalyticsResponse response = analyticsService.getComprehensiveAnalytics(timeRange, from, to);
        return ResponseEntity.ok(response.getTripAnalytics());
    }

    @GetMapping("/destinations")
    public ResponseEntity<ComprehensiveAnalyticsResponse.DestinationAnalyticsSection> getDestinationAnalytics(
            @RequestParam(value = "timeRange", required = false, defaultValue = "30d") String timeRange,
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        ComprehensiveAnalyticsResponse response = analyticsService.getComprehensiveAnalytics(timeRange, from, to);
        return ResponseEntity.ok(response.getDestinationAnalytics());
    }

    @GetMapping("/budgets")
    public ResponseEntity<BudgetAnalyticsDTO> getBudgetAnalytics() {
        BudgetAnalyticsDTO budgetAnalytics = analyticsService.buildBudgetAnalytics();
        return ResponseEntity.ok(budgetAnalytics);
    }
}
