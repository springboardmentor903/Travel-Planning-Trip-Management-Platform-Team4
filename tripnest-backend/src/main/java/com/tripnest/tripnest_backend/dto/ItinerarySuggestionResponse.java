package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItinerarySuggestionResponse {

    private Integer tripId;
    private String destinationName;
    private String country;
    private String city;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalDays;
    private Double totalBudget;

    // AI-Style Travel Assistant Sections
    private String tripOverview;
    private List<DailyStrategyResponse> dailyStrategy;
    private List<SuggestedDayResponse> itinerary;
    private List<RecommendedPlaceResponse> recommendations;
    private List<String> planningTips;
    private List<String> warnings;
    private BudgetInsightsResponse budgetInsights;
}
