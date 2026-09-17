package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.*;
import com.tripnest.tripnest_backend.entity.PackingCategory;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.TripPackingItem;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.TripPackingItemRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackingChecklistService {

    private final TripPackingItemRepository packingItemRepository;
    private final TripRepository tripRepository;
    private final WeatherService weatherService;
    private final TripAccessService tripAccessService;

    @Transactional
    public PackingChecklistResponse getOrGeneratePackingChecklist(Integer tripId, String userEmail) {
        tripAccessService.validateTripAccess(tripId, userEmail);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        boolean exists = packingItemRepository.existsByTripId(tripId);
        if (!exists) {
            generateSmartItemsForTrip(trip);
        }

        return buildChecklistResponse(trip);
    }

    @Transactional
    public PackingChecklistResponse regeneratePackingChecklist(Integer tripId, String userEmail) {
        tripAccessService.validateTripAccess(tripId, userEmail);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        generateSmartItemsForTrip(trip);
        return buildChecklistResponse(trip);
    }

    @Transactional
    public PackingItemDTO addCustomItem(Integer tripId, CreatePackingItemRequest request, String userEmail) {
        tripAccessService.validateTripAccess(tripId, userEmail);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Packing item name is required");
        }
        if (request.getCategory() == null) {
            throw new IllegalArgumentException("Packing item category is required");
        }

        TripPackingItem item = new TripPackingItem();
        item.setTrip(trip);
        item.setName(request.getName().trim());
        item.setCategory(request.getCategory());
        item.setIsPacked(false);
        item.setIsCustom(true);
        item.setReason(request.getReason() != null ? request.getReason() : "Custom traveler item");

        TripPackingItem saved = packingItemRepository.save(item);
        return mapToDTO(saved);
    }

    @Transactional
    public PackingItemDTO updateItem(Integer tripId, Integer itemId, UpdatePackingItemRequest request, String userEmail) {
        tripAccessService.validateTripAccess(tripId, userEmail);

        TripPackingItem item = packingItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Packing item not found with id: " + itemId));

        if (!item.getTrip().getId().equals(tripId)) {
            throw new IllegalArgumentException("Item does not belong to trip with id: " + tripId);
        }

        if (request.getPacked() != null) {
            item.setIsPacked(request.getPacked());
        }
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            item.setName(request.getName().trim());
        }
        if (request.getCategory() != null) {
            item.setCategory(request.getCategory());
        }

        TripPackingItem updated = packingItemRepository.save(item);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteItem(Integer tripId, Integer itemId, String userEmail) {
        tripAccessService.validateTripAccess(tripId, userEmail);

        TripPackingItem item = packingItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Packing item not found with id: " + itemId));

        if (!item.getTrip().getId().equals(tripId)) {
            throw new IllegalArgumentException("Item does not belong to trip with id: " + tripId);
        }

        packingItemRepository.delete(item);
    }

    private void generateSmartItemsForTrip(Trip trip) {
        WeatherResponse weather = null;
        try {
            if (trip.getDestination() != null && trip.getDestination().getId() != null) {
                weather = weatherService.getWeatherForDestination(trip.getDestination().getId());
            }
        } catch (Exception ex) {
            // Weather service exception handled gracefully - fallback to deterministic defaults
        }

        List<SmartPackingRuleItem> smartItems = evaluateSmartPackingRules(trip, weather);

        List<TripPackingItem> existingItems = packingItemRepository.findByTripId(trip.getId());
        Set<String> existingNames = existingItems.stream()
                .map(i -> i.getName().toLowerCase().trim())
                .collect(Collectors.toSet());

        List<TripPackingItem> toSave = new ArrayList<>();
        for (SmartPackingRuleItem rule : smartItems) {
            if (!existingNames.contains(rule.name.toLowerCase().trim())) {
                TripPackingItem item = new TripPackingItem();
                item.setTrip(trip);
                item.setName(rule.name);
                item.setCategory(rule.category);
                item.setIsPacked(false);
                item.setIsCustom(false);
                item.setReason(rule.reason);
                toSave.add(item);
            }
        }

        if (!toSave.isEmpty()) {
            packingItemRepository.saveAll(toSave);
        }
    }

    private PackingChecklistResponse buildChecklistResponse(Trip trip) {
        List<TripPackingItem> items = packingItemRepository.findByTripIdOrderByCategoryAsc(trip.getId());

        WeatherResponse weather = null;
        boolean weatherAvailable = false;
        String weatherSummary = "Weather data unavailable. Showing general destination packing recommendations.";
        String condition = null;
        Double temp = null;

        try {
            if (trip.getDestination() != null && trip.getDestination().getId() != null) {
                weather = weatherService.getWeatherForDestination(trip.getDestination().getId());
                if (weather != null) {
                    weatherAvailable = true;
                    condition = weather.getCondition();
                    temp = weather.getTemperature();
                    weatherSummary = (condition != null ? condition : "Forecast") + " expected • " + Math.round(temp != null ? temp : 20.0) + "°C";
                }
            }
        } catch (Exception ex) {
            // Handled gracefully per requirements
        }

        List<PackingItemDTO> dtoList = items.stream().map(this::mapToDTO).toList();
        int total = items.size();
        int packedCount = (int) items.stream().filter(i -> Boolean.TRUE.equals(i.getIsPacked())).count();

        return new PackingChecklistResponse(
                trip.getId(),
                condition,
                temp,
                weatherAvailable,
                weatherSummary,
                total,
                packedCount,
                dtoList
        );
    }

    private List<SmartPackingRuleItem> evaluateSmartPackingRules(Trip trip, WeatherResponse weather) {
        List<SmartPackingRuleItem> rules = new ArrayList<>();

        // 1. General Travel Essentials (Always Recommended)
        rules.add(new SmartPackingRuleItem("Passport / Government Photo ID", PackingCategory.DOCUMENTS, "Essential travel identification"));
        rules.add(new SmartPackingRuleItem("Boarding Pass & Travel Tickets", PackingCategory.DOCUMENTS, "Essential travel documents"));
        rules.add(new SmartPackingRuleItem("Mobile Phone & Fast Charger", PackingCategory.ELECTRONICS, "Essential communication & tech"));
        rules.add(new SmartPackingRuleItem("Portable Power Bank", PackingCategory.ELECTRONICS, "On-the-go charging supply"));
        rules.add(new SmartPackingRuleItem("Basic First-Aid & Medicines", PackingCategory.HEALTH, "Personal health & safety"));
        rules.add(new SmartPackingRuleItem("Personal Toiletries & Hand Sanitizer", PackingCategory.HEALTH, "Daily hygiene essentials"));
        rules.add(new SmartPackingRuleItem("Comfortable Walking Shoes", PackingCategory.FOOTWEAR, "Sightseeing & everyday travel"));

        // 2. Weather Deterministic Rules
        if (weather != null) {
            double temp = weather.getTemperature();
            String cond = weather.getCondition() != null ? weather.getCondition().toLowerCase() : "";

            // Rain Rules
            if (cond.contains("rain") || cond.contains("drizzle") || cond.contains("thunderstorm") || weather.getHumidity() > 80) {
                rules.add(new SmartPackingRuleItem("Compact Travel Umbrella", PackingCategory.RAIN_PROTECTION, "Rain is expected during your trip. We recommend packing a compact umbrella."));
                rules.add(new SmartPackingRuleItem("Waterproof Rain Jacket / Poncho", PackingCategory.RAIN_PROTECTION, "Precipitation expected at your destination."));
                rules.add(new SmartPackingRuleItem("Water-Resistant Footwear", PackingCategory.FOOTWEAR, "Protects against rain & wet streets."));
            }

            // Cold Weather Rules
            if (temp < 15.0 && temp >= 5.0) {
                rules.add(new SmartPackingRuleItem("Warm Insulated Jacket", PackingCategory.CLOTHING, "Temperatures may fall below 15°C. Add a warm jacket."));
                rules.add(new SmartPackingRuleItem("Sweater / Fleece Layer", PackingCategory.CLOTHING, "Cool weather expected at destination."));
                rules.add(new SmartPackingRuleItem("Warm Gloves & Beanie", PackingCategory.ACCESSORIES, "Chilly evening weather expected."));
            }

            // Freezing / Snow Rules
            if (temp < 5.0 || cond.contains("snow")) {
                rules.add(new SmartPackingRuleItem("Heavy Winter Parka Coat", PackingCategory.CLOTHING, "Freezing weather expected below 5°C. Heavy coat required."));
                rules.add(new SmartPackingRuleItem("Thermal Base Layers", PackingCategory.CLOTHING, "Sub-zero cold protection."));
                rules.add(new SmartPackingRuleItem("Thermal Gloves & Scarf", PackingCategory.ACCESSORIES, "Snow and freezing wind expected."));
                rules.add(new SmartPackingRuleItem("Insulated Waterproof Boots", PackingCategory.FOOTWEAR, "Snowy or icy ground conditions."));
            }

            // Hot Weather Rules
            if (temp > 24.0) {
                rules.add(new SmartPackingRuleItem("Breathable T-shirts & Tops", PackingCategory.CLOTHING, "Warm & sunny weather expected (> 24°C)."));
                rules.add(new SmartPackingRuleItem("Lightweight Shorts / Summer Wear", PackingCategory.CLOTHING, "Warm temperatures expected at destination."));
                rules.add(new SmartPackingRuleItem("UV Protection Sunglasses", PackingCategory.ACCESSORIES, "Bright sun & UV exposure expected."));
                rules.add(new SmartPackingRuleItem("Wide-Brim Sun Hat", PackingCategory.ACCESSORIES, "Protection against direct sunlight."));
                rules.add(new SmartPackingRuleItem("Sunscreen SPF 50+", PackingCategory.HEALTH, "High UV index expected. Protect your skin."));
                rules.add(new SmartPackingRuleItem("Reusable Water Bottle", PackingCategory.OTHER, "Stay hydrated in warm weather."));
            }
        } else {
            // Generic Destination Rules when weather is unavailable
            rules.add(new SmartPackingRuleItem("All-Weather Jacket / Windbreaker", PackingCategory.CLOTHING, "General weather protection"));
            rules.add(new SmartPackingRuleItem("Sunglasses & Sunscreen", PackingCategory.ACCESSORIES, "General sun protection"));
            rules.add(new SmartPackingRuleItem("Reusable Water Bottle", PackingCategory.OTHER, "General travel hydration"));
        }

        // 3. Trip Duration Rules
        if (trip.getStartDate() != null && trip.getEndDate() != null) {
            try {
                LocalDate start = trip.getStartDate();
                LocalDate end = trip.getEndDate();
                long days = ChronoUnit.DAYS.between(start, end) + 1;
                if (days > 5) {
                    rules.add(new SmartPackingRuleItem("Extra Pair of Outfits & Socks", PackingCategory.CLOTHING, "Multi-day trip duration (" + days + " days)."));
                    rules.add(new SmartPackingRuleItem("Travel Plug Adapter", PackingCategory.ELECTRONICS, "Extended multi-day trip requirement."));
                }
            } catch (Exception ex) {
                // Ignore date calculation fallback
            }
        }

        return rules;
    }

    private PackingItemDTO mapToDTO(TripPackingItem item) {
        return new PackingItemDTO(
                item.getId(),
                item.getTrip().getId(),
                item.getName(),
                item.getCategory(),
                Boolean.TRUE.equals(item.getIsPacked()),
                Boolean.TRUE.equals(item.getIsCustom()),
                item.getReason()
        );
    }

    private static class SmartPackingRuleItem {
        String name;
        PackingCategory category;
        String reason;

        SmartPackingRuleItem(String name, PackingCategory category, String reason) {
            this.name = name;
            this.category = category;
            this.reason = reason;
        }
    }
}
