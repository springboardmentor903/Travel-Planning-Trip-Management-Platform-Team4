package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.*;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.entity.Trip;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmartItineraryGeneratorService {

    private final DestinationRecommendationService destinationRecommendationService;

    public ItinerarySuggestionResponse generateItinerarySuggestions(Trip trip, SmartItineraryRequest request, String userEmail) {
        Destination destination = trip.getDestination();
        String destName = destination != null ? destination.getName() : "Destination";
        String city = destination != null && destination.getCity() != null ? destination.getCity() : destName;
        String country = destination != null && destination.getCountry() != null ? destination.getCountry() : "";

        LocalDate startDate = trip.getStartDate();
        LocalDate endDate = trip.getEndDate();
        long daysCount = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        int totalDays = (int) Math.max(1, daysCount);

        // Fetch categorized destination recommendations
        List<RecommendedPlaceResponse> recommendations = new ArrayList<>();
        try {
            DestinationRecommendationResponse recResponse = destinationRecommendationService.getRecommendationsForTrip(trip.getId(), userEmail);
            if (recResponse != null && recResponse.getAllRecommendations() != null) {
                recommendations = recResponse.getAllRecommendations();
            }
        } catch (Exception ex) {
            log.warn("Failed to fetch recommendation places for tripId={}: {}", trip.getId(), ex.getMessage());
        }

        int targetActivitiesPerDay = getTargetActivitiesPerDay(request != null ? request.getPace() : "BALANCED");
        int transitBufferMinutes = getTransitBufferMinutes(request != null ? request.getTransportationPreference() : "PUBLIC_TRANSPORT");
        LocalTime startLocalTime = parseStartTime(request != null ? request.getPreferredStartTime() : null);

        Set<String> usedPlaceNames = new HashSet<>();
        List<SuggestedDayResponse> itinerary = new ArrayList<>();
        List<DailyStrategyResponse> dailyStrategy = new ArrayList<>();
        double estimatedTotalCostNumeric = 0.0;

        for (int dayNum = 1; dayNum <= totalDays; dayNum++) {
            LocalDate currentDate = startDate.plusDays(dayNum - 1);
            String dayTheme = getDayTheme(dayNum, totalDays, city, request);
            String dayStrategyDesc = getDayStrategyDescription(dayNum, totalDays, city, request);

            dailyStrategy.add(new DailyStrategyResponse(dayNum, dayTheme, dayStrategyDesc));

            String dayTitle = "Day " + dayNum + ": " + dayTheme;
            String dayDescription = String.format("Day %d in %s — %s pacing focused on %s.",
                    dayNum, city, getPaceName(request).toLowerCase(), getStyleName(request));

            List<SuggestedActivityResponse> dayActivities = buildDayActivities(
                    currentDate,
                    dayNum,
                    city,
                    startLocalTime,
                    targetActivitiesPerDay,
                    transitBufferMinutes,
                    request,
                    recommendations,
                    usedPlaceNames
            );

            for (SuggestedActivityResponse act : dayActivities) {
                estimatedTotalCostNumeric += parseCostEstimate(act.getEstimatedCost());
            }

            itinerary.add(new SuggestedDayResponse(
                    dayNum,
                    currentDate,
                    dayTitle,
                    dayDescription,
                    dayActivities
            ));
        }

        // 1. Trip Overview
        String tripOverview = generateTripOverview(destName, city, totalDays, request);

        // 2. Planning Tips
        List<String> planningTips = generatePlanningTips(destName, request, totalDays);

        // 3. Smart Warnings
        List<String> warnings = generateSmartWarnings(trip, request, itinerary, estimatedTotalCostNumeric);

        // 4. Budget Insights
        BudgetInsightsResponse budgetInsights = generateBudgetInsights(trip, request, totalDays, estimatedTotalCostNumeric);

        return new ItinerarySuggestionResponse(
                trip.getId(),
                destName,
                country,
                city,
                startDate,
                endDate,
                totalDays,
                trip.getBudget(),
                tripOverview,
                dailyStrategy,
                itinerary,
                recommendations,
                planningTips,
                warnings,
                budgetInsights
        );
    }

    public SmartItineraryResponse generateSuggestions(Trip trip, SmartItineraryRequest request) {
        ItinerarySuggestionResponse fullResponse = generateItinerarySuggestions(trip, request, "system");
        return new SmartItineraryResponse(
                fullResponse.getTripId(),
                fullResponse.getDestinationName(),
                fullResponse.getTotalDays(),
                fullResponse.getItinerary()
        );
    }

    private String generateTripOverview(String destName, String city, int totalDays, SmartItineraryRequest request) {
        String style = getStyleName(request);
        String pace = getPaceName(request).toLowerCase();
        return String.format(
                "Your %d-day trip to %s can include a %s mix of %s exploration, famous attractions, authentic dining, and local experiences tailored for a %s pace.",
                totalDays, city, pace, style.toLowerCase(), pace
        );
    }

    private String getDayTheme(int dayNum, int totalDays, String city, SmartItineraryRequest request) {
        String style = getStyleName(request);
        if (dayNum == 1) {
            return "Arrival & " + city + " Central Highlights";
        } else if (dayNum == totalDays) {
            return "Farewell Memory Trail & Sunset Views";
        } else if (dayNum % 3 == 2) {
            return style + " Museums & Architectural Gems";
        } else if (dayNum % 3 == 0) {
            return "Nature Walk, Gardens & Scenic Spots";
        } else {
            return "Local Markets, Culinary Quarter & Hidden Spots";
        }
    }

    private String getDayStrategyDescription(int dayNum, int totalDays, String city, SmartItineraryRequest request) {
        if (dayNum == 1) {
            return "Settle in and explore famous city center landmarks and central dining quarters.";
        } else if (dayNum == totalDays) {
            return "Enjoy relaxing morning cafes, souvenir shopping, and panoramic sunset views.";
        } else if (dayNum % 3 == 2) {
            return "Dedicate the morning and afternoon to top museums and cultural heritage sites.";
        } else if (dayNum % 3 == 0) {
            return "Combine morning botanical garden strolls with afternoon river and nature excursions.";
        } else {
            return "Discover artisanal food markets, local handicraft shops, and neighborhood cafes.";
        }
    }

    private int getTargetActivitiesPerDay(String pace) {
        if (pace == null) return 4;
        switch (pace.toUpperCase().trim()) {
            case "RELAXED":
                return 3;
            case "PACKED":
                return 6;
            case "BALANCED":
            default:
                return 4;
        }
    }

    private int getTransitBufferMinutes(String transport) {
        if (transport == null) return 30;
        switch (transport.toUpperCase().trim()) {
            case "WALKING":
                return 20;
            case "TAXI":
            case "RENTAL_VEHICLE":
            case "RENTAL VEHICLE":
                return 15;
            case "PUBLIC_TRANSPORT":
            case "PUBLIC TRANSPORT":
            default:
                return 30;
        }
    }

    private LocalTime parseStartTime(String preferredStartTime) {
        if (preferredStartTime == null) return LocalTime.of(9, 0);
        String upper = preferredStartTime.toUpperCase().trim();
        if (upper.contains("EARLY")) return LocalTime.of(8, 0);
        if (upper.contains("LATE")) return LocalTime.of(10, 30);
        return LocalTime.of(9, 0);
    }

    private String getPaceName(SmartItineraryRequest request) {
        return (request != null && request.getPace() != null) ? request.getPace() : "Balanced";
    }

    private String getStyleName(SmartItineraryRequest request) {
        return (request != null && request.getTravelStyle() != null) ? request.getTravelStyle() : "Culture & Discovery";
    }

    private List<SuggestedActivityResponse> buildDayActivities(
            LocalDate date,
            int dayNum,
            String city,
            LocalTime startTime,
            int targetCount,
            int transitBuffer,
            SmartItineraryRequest request,
            List<RecommendedPlaceResponse> recPlaces,
            Set<String> usedPlaceNames
    ) {
        List<SuggestedActivityResponse> activities = new ArrayList<>();
        LocalDateTime currentTime = LocalDateTime.of(date, startTime);

        String foodPref = (request != null && request.getFoodPreference() != null) ? request.getFoodPreference() : "Local Specialties";
        String transport = (request != null && request.getTransportationPreference() != null) ? request.getTransportationPreference() : "Public Transport";

        // 1. Breakfast Slot
        LocalDateTime bfEnd = currentTime.plusMinutes(45);
        activities.add(new SuggestedActivityResponse(
                "Breakfast & Local Cafe in " + city,
                "Start the day with fresh pastries, regional coffee, and " + foodPref.toLowerCase() + ".",
                city + " Central Bakery & Cafe",
                "Dining",
                currentTime,
                bfEnd,
                "45 mins",
                "€10"
        ));
        currentTime = bfEnd.plusMinutes(transitBuffer);

        // 2. Morning Major Attraction
        RecommendedPlaceResponse morningSpot = findUnusedPlace(recPlaces, usedPlaceNames, "Must Visit", "Historical & Cultural");
        String morningSpotName = morningSpot != null ? morningSpot.getName() : city + " Historic Citadel & Square";
        String morningLoc = morningSpot != null ? morningSpot.getLocation() : city + " Heritage Zone";

        LocalDateTime mEnd = currentTime.plusHours(2);
        activities.add(new SuggestedActivityResponse(
                morningSpotName,
                "Explore iconic landmarks and historical heritage of " + city + " via " + transport.toLowerCase() + ".",
                morningLoc,
                "Sightseeing",
                currentTime,
                mEnd,
                "2 hours",
                morningSpot != null ? morningSpot.getEstimatedCost() : "€15"
        ));
        currentTime = mEnd.plusMinutes(transitBuffer);

        // 3. Lunch Slot
        LocalDateTime lunchEnd = currentTime.plusHours(1).plusMinutes(15);
        activities.add(new SuggestedActivityResponse(
                "Lunch: " + foodPref + " Bistro",
                "Savor regional cooking and authentic local specialties.",
                city + " Culinary Quarter",
                "Dining",
                currentTime,
                lunchEnd,
                "1h 15m",
                "€20"
        ));
        currentTime = lunchEnd.plusMinutes(transitBuffer);

        // 4. Afternoon Activity
        RecommendedPlaceResponse afternoonSpot = findUnusedPlace(recPlaces, usedPlaceNames, "Nature & Scenic", "Historical & Cultural", "Shopping");
        String afternoonSpotName = afternoonSpot != null ? afternoonSpot.getName() : city + " Cultural Promenade & Gardens";
        String afternoonLoc = afternoonSpot != null ? afternoonSpot.getLocation() : city + " Arts District";

        LocalDateTime afEnd = currentTime.plusHours(2);
        activities.add(new SuggestedActivityResponse(
                afternoonSpotName,
                "Enjoy museum exhibitions, scenic walks, and local handicraft shopping.",
                afternoonLoc,
                "Culture & Leisure",
                currentTime,
                afEnd,
                "2 hours",
                afternoonSpot != null ? afternoonSpot.getEstimatedCost() : "Free"
        ));
        currentTime = afEnd.plusMinutes(transitBuffer);

        // 5. Additional Afternoon / Evening Spots for BALANCED or PACKED pace
        if (targetCount >= 5) {
            RecommendedPlaceResponse extraSpot = findUnusedPlace(recPlaces, usedPlaceNames, "Hidden Gems", "Shopping", "Adventure & Activities");
            String extraName = extraSpot != null ? extraSpot.getName() : city + " Sunset Lookout & Artisanal Market";
            String extraLoc = extraSpot != null ? extraSpot.getLocation() : city + " High Street";

            LocalDateTime exEnd = currentTime.plusHours(1).plusMinutes(30);
            activities.add(new SuggestedActivityResponse(
                    extraName,
                    "Discover picturesque photo spots and vibrant artisanal markets.",
                    extraLoc,
                    "Exploration",
                    currentTime,
                    exEnd,
                    "1h 30m",
                    "€10"
            ));
            currentTime = exEnd.plusMinutes(transitBuffer);
        }

        // 6. Dinner & Nightlife
        if (targetCount >= 4 || dayNum % 2 == 1) {
            LocalDateTime dinnerStart = LocalDateTime.of(date, LocalTime.of(19, 30));
            if (dinnerStart.isBefore(currentTime)) {
                dinnerStart = currentTime.plusMinutes(15);
            }
            LocalDateTime dinnerEnd = dinnerStart.plusHours(2);
            activities.add(new SuggestedActivityResponse(
                    "Dinner & Evening Stroll in " + city,
                    "Relax with panoramic views, wine, and evening street ambiance.",
                    city + " Waterfront & Downtown",
                    "Dining & Nightlife",
                    dinnerStart,
                    dinnerEnd,
                    "2 hours",
                    "€30"
            ));
        }

        return activities;
    }

    private RecommendedPlaceResponse findUnusedPlace(List<RecommendedPlaceResponse> recPlaces, Set<String> usedNames, String... preferredCategories) {
        if (recPlaces == null || recPlaces.isEmpty()) return null;

        for (String prefCat : preferredCategories) {
            for (RecommendedPlaceResponse p : recPlaces) {
                if (p.getCategory() != null && p.getCategory().equalsIgnoreCase(prefCat) && !usedNames.contains(p.getName())) {
                    usedNames.add(p.getName());
                    return p;
                }
            }
        }

        for (RecommendedPlaceResponse p : recPlaces) {
            if (!usedNames.contains(p.getName())) {
                usedNames.add(p.getName());
                return p;
            }
        }

        return null;
    }

    private double parseCostEstimate(String costStr) {
        if (costStr == null || costStr.equalsIgnoreCase("free")) return 0.0;
        try {
            String cleaned = costStr.replaceAll("[^0-9.]", " ").trim();
            String[] tokens = cleaned.split("\\s+");
            if (tokens.length > 0 && !tokens[0].isEmpty()) {
                return Double.parseDouble(tokens[0]);
            }
        } catch (Exception ignored) {}
        return 15.0;
    }

    private List<String> generatePlanningTips(String destName, SmartItineraryRequest request, int totalDays) {
        List<String> tips = new ArrayList<>();
        tips.add("Visit popular attractions early in the morning to avoid peak crowds and long queue delays.");
        tips.add("Group nearby locations together to minimize transit times across " + destName + ".");
        tips.add("Reserve evenings for relaxed dining, cafes, and local nightlife.");
        tips.add("Keep one flexible activity slot each day for spontaneous discoveries or weather adjustments.");
        tips.add("Avoid scheduling distant locations on the same day to prevent travel burnout.");
        return tips;
    }

    private List<String> generateSmartWarnings(Trip trip, SmartItineraryRequest request, List<SuggestedDayResponse> itinerary, double estimatedTotalCost) {
        List<String> warnings = new ArrayList<>();
        String pace = getPaceName(request).toUpperCase();
        String transport = request != null && request.getTransportationPreference() != null ? request.getTransportationPreference().toUpperCase() : "";

        for (SuggestedDayResponse day : itinerary) {
            if (day.getActivities() != null && day.getActivities().size() >= 5) {
                warnings.add(String.format("Day %d contains 5+ activities — consider pacing out travel time between locations.", day.getDayNumber()));
                break;
            }
        }

        if (transport.contains("WALK")) {
            warnings.add("Attractions in " + (trip.getDestination() != null ? trip.getDestination().getName() : "the destination") + " are spread out — consider using public transit or taxis for distant spots.");
        }

        if (trip.getBudget() != null && trip.getBudget() > 0 && estimatedTotalCost > trip.getBudget()) {
            warnings.add(String.format("Estimated itinerary costs (€%.0f) exceed your trip budget (€%.0f). Consider choosing budget dining options.", estimatedTotalCost, trip.getBudget()));
        }

        return warnings;
    }

    private BudgetInsightsResponse generateBudgetInsights(Trip trip, SmartItineraryRequest request, int totalDays, double totalActivitiesCost) {
        double accommodationPerNight = 60.0;
        double foodPerDay = 45.0;
        double transportPerDay = 15.0;

        String budgetPref = request != null && request.getBudgetPreference() != null ? request.getBudgetPreference().toUpperCase() : "MODERATE";

        if (budgetPref.contains("BUDGET")) {
            accommodationPerNight = 35.0;
            foodPerDay = 25.0;
            transportPerDay = 10.0;
        } else if (budgetPref.contains("PREMIUM") || budgetPref.contains("LUXURY")) {
            accommodationPerNight = 150.0;
            foodPerDay = 90.0;
            transportPerDay = 40.0;
        }

        double totalAccom = accommodationPerNight * (totalDays - 1);
        double totalFood = foodPerDay * totalDays;
        double totalTransport = transportPerDay * totalDays;
        double grandTotal = totalAccom + totalFood + totalTransport + totalActivitiesCost;
        double dailyAvg = grandTotal / totalDays;

        String dailyRange = String.format("€%.0f - €%.0f / day", dailyAvg * 0.9, dailyAvg * 1.1);
        String accomStr = String.format("€%.0f / night", accommodationPerNight);
        String foodStr = String.format("€%.0f / day", foodPerDay);
        String transportStr = String.format("€%.0f / day", transportPerDay);
        String actStr = String.format("€%.0f total", totalActivitiesCost);
        String totalStr = String.format("€%.0f total per person", grandTotal);

        String message = String.format("Estimated total of €%.0f aligns well with a %s travel profile.", grandTotal, budgetPref.toLowerCase());

        return new BudgetInsightsResponse(
                dailyRange,
                accomStr,
                foodStr,
                transportStr,
                actStr,
                totalStr,
                message
        );
    }
}
