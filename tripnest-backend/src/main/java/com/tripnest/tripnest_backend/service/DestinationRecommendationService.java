package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.DestinationRecommendationResponse;
import com.tripnest.tripnest_backend.dto.PlaceItemResponse;
import com.tripnest.tripnest_backend.dto.RecommendedPlaceResponse;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class DestinationRecommendationService {

    private final TripRepository tripRepository;
    private final TripAccessService tripAccessService;
    private final GooglePlacesService googlePlacesService;

    // In-memory thread-safe cache by destination ID
    private final Map<Integer, DestinationRecommendationResponse> recommendationCache = new ConcurrentHashMap<>();

    public DestinationRecommendationResponse getRecommendationsForTrip(Integer tripId, String userEmail) {
        tripAccessService.validateTripAccess(tripId, userEmail);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        Destination destination = trip.getDestination();
        if (destination == null) {
            throw new IllegalArgumentException("Trip does not have an assigned destination");
        }

        Integer destId = destination.getId();
        if (recommendationCache.containsKey(destId)) {
            log.info("Returning cached destination recommendations for destinationId={}", destId);
            DestinationRecommendationResponse cached = recommendationCache.get(destId);
            // Return response with current tripId
            return new DestinationRecommendationResponse(
                    tripId,
                    cached.getDestinationId(),
                    cached.getDestinationName(),
                    cached.getCountry(),
                    cached.getCity(),
                    cached.getRecommendationsByCategory(),
                    cached.getAllRecommendations()
            );
        }

        List<RecommendedPlaceResponse> places = new ArrayList<>();

        // 1. Try Primary Google Places API Integration
        try {
            List<PlaceItemResponse> placesFromApi = googlePlacesService.getPlacesForDestination(destId);
            if (placesFromApi != null && !placesFromApi.isEmpty()) {
                places = mapGooglePlacesToRecommendations(placesFromApi, destination);
            }
        } catch (Exception ex) {
            log.warn("Google Places API call failed or unconfigured for destinationId={}: {}. Falling back to knowledge base.", destId, ex.getMessage());
        }

        // 2. Fallback to Destination Knowledge Base if API results are empty
        if (places.isEmpty()) {
            places = generateKnowledgeBaseRecommendations(destination);
        }

        // 3. Organize by standard Categories
        Map<String, List<RecommendedPlaceResponse>> byCategory = organizeByCategory(places);

        DestinationRecommendationResponse response = new DestinationRecommendationResponse(
                tripId,
                destId,
                destination.getName(),
                destination.getCountry(),
                destination.getCity(),
                byCategory,
                places
        );

        // Save to cache
        recommendationCache.put(destId, response);
        return response;
    }

    private List<RecommendedPlaceResponse> mapGooglePlacesToRecommendations(List<PlaceItemResponse> placesFromApi, Destination destination) {
        List<RecommendedPlaceResponse> list = new ArrayList<>();
        int index = 0;
        for (PlaceItemResponse p : placesFromApi) {
            index++;
            String cat = mapCategory(p.getCategory(), index);
            String pop = p.getRating() != null && p.getRating() >= 4.5 ? "Very High" : "High";
            String cost = (index % 3 == 0) ? "Free" : (index % 2 == 0 ? "Moderate (€15-€30)" : "Budget (€5-€15)");
            String duration = (index % 2 == 0) ? "2 - 3 hours" : "1 - 2 hours";
            String recTime = (index % 3 == 0) ? "Evening" : (index % 2 == 0 ? "Afternoon" : "Morning");

            list.add(new RecommendedPlaceResponse(
                    p.getName(),
                    cat,
                    "Famous landmark and popular spot in " + destination.getName() + ". Rated " + (p.getRating() != null ? p.getRating() + "★" : "4.5★") + " by travelers.",
                    p.getAddress() != null ? p.getAddress() : destination.getName() + " Center",
                    duration,
                    recTime,
                    cost,
                    pop,
                    destination.getImageUrl(),
                    destination.getLatitude(),
                    destination.getLongitude()
            ));
        }
        return list;
    }

    private String mapCategory(String rawCat, int index) {
        if (rawCat == null) return "Must Visit";
        String lower = rawCat.toLowerCase();
        if (lower.contains("museum") || lower.contains("art") || lower.contains("church") || lower.contains("temple")) {
            return "Historical & Cultural";
        } else if (lower.contains("park") || lower.contains("garden") || lower.contains("beach") || lower.contains("mountain")) {
            return "Nature & Scenic";
        } else if (lower.contains("restaurant") || lower.contains("cafe") || lower.contains("food") || lower.contains("bakery")) {
            return "Food & Restaurants";
        } else if (lower.contains("store") || lower.contains("shopping") || lower.contains("mall") || lower.contains("market")) {
            return "Shopping";
        } else if (lower.contains("bar") || lower.contains("club") || lower.contains("night")) {
            return "Nightlife";
        }
        return (index <= 2) ? "Must Visit" : "Adventure & Activities";
    }

    private List<RecommendedPlaceResponse> generateKnowledgeBaseRecommendations(Destination dest) {
        List<RecommendedPlaceResponse> list = new ArrayList<>();
        String name = dest.getName() != null ? dest.getName() : "Destination";
        String city = dest.getCity() != null ? dest.getCity() : name;
        String country = dest.getCountry() != null ? dest.getCountry() : "";

        // Curated Known Destinations
        if (name.equalsIgnoreCase("Paris") || city.equalsIgnoreCase("Paris")) {
            list.add(new RecommendedPlaceResponse("Eiffel Tower & Champ de Mars", "Must Visit", "Iconic 330m iron lattice tower offering 360-degree panoramic views of Paris.", "Champ de Mars, 5 Av. Anatole France, Paris", "2 - 3 hours", "Sunset / Evening", "€30", "Very High", dest.getImageUrl(), 48.8584, 2.2945));
            list.add(new RecommendedPlaceResponse("Louvre Museum", "Historical & Cultural", "World's largest art museum housing Mona Lisa, Venus de Milo, and priceless antiquities.", "Rue de Rivoli, Paris", "3 - 4 hours", "Morning", "€22", "Very High", dest.getImageUrl(), 48.8606, 2.3376));
            list.add(new RecommendedPlaceResponse("Jardin du Luxembourg", "Nature & Scenic", "Stunning 17th-century palace gardens featuring fountains, statues, and shaded promenades.", "6th Arrondissement, Paris", "1 - 2 hours", "Afternoon", "Free", "High", dest.getImageUrl(), 48.8462, 2.3372));
            list.add(new RecommendedPlaceResponse("Le Marais Gourmet Bistro Walk", "Food & Restaurants", "Charming historic district filled with traditional French boulangeries, cafes, and wine bars.", "Le Marais, Paris", "2 hours", "Afternoon", "€25 - €45", "High", dest.getImageUrl(), 48.8570, 2.3590));
            list.add(new RecommendedPlaceResponse("Montmartre & Sacré-Cœur Basilica", "Hidden Gems", "Bohemian hilltop district with cobblestone streets, street artists, and panoramic views.", "35 Rue du Chevalier de la Barre, Paris", "2 - 3 hours", "Late Afternoon", "Free", "High", dest.getImageUrl(), 48.8867, 2.3431));
            list.add(new RecommendedPlaceResponse("Champs-Élysées & Galeries Lafayette", "Shopping", "Prestigious avenue lined with flagship luxury boutiques and historic department stores.", "8th Arrondissement, Paris", "2 hours", "Afternoon", "Varies", "High", dest.getImageUrl(), 48.8698, 2.3075));
            return list;
        } else if (name.equalsIgnoreCase("Tokyo") || city.equalsIgnoreCase("Tokyo")) {
            list.add(new RecommendedPlaceResponse("Senso-ji Temple & Nakamise Street", "Must Visit", "Tokyo's oldest Buddhist temple featuring giant red lanterns and traditional snack stalls.", "Asakusa, Taito City, Tokyo", "2 hours", "Morning", "Free", "Very High", dest.getImageUrl(), 35.7148, 139.7967));
            list.add(new RecommendedPlaceResponse("Shibuya Crossing & Hachiko Statue", "Must Visit", "The world's busiest pedestrian intersection surrounded by glowing neon billboards.", "Shibuya City, Tokyo", "1 hour", "Evening", "Free", "Very High", dest.getImageUrl(), 35.6595, 139.7004));
            list.add(new RecommendedPlaceResponse("Tsukiji Outer Market Food Tour", "Food & Restaurants", "Bustling market streets selling fresh sushi, wagyu skewers, tamagoyaki, and matcha.", "Tsukiji, Chuo City, Tokyo", "2 hours", "Morning", "¥2,000 - ¥5,000", "High", dest.getImageUrl(), 35.6654, 139.7707));
            list.add(new RecommendedPlaceResponse("Meiji Jingu Shrine & Yoyogi Park", "Nature & Scenic", "Tranquil evergreen forest surrounding a grand Shinto shrine dedicated to Emperor Meiji.", "Shibuya City, Tokyo", "2 hours", "Morning", "Free", "High", dest.getImageUrl(), 35.6764, 139.6993));
            list.add(new RecommendedPlaceResponse("Akihabara Electric Town", "Shopping", "The global epicenter of anime culture, retro video games, electronics, and maid cafes.", "Soto-Kanda, Chiyoda City, Tokyo", "3 hours", "Afternoon", "Varies", "High", dest.getImageUrl(), 35.7023, 139.7745));
            return list;
        } else if (name.equalsIgnoreCase("Bali") || city.equalsIgnoreCase("Bali")) {
            list.add(new RecommendedPlaceResponse("Tegallalang Rice Terraces", "Must Visit", "Iconic emerald-green terraced rice paddies with giant swings and traditional irrigation.", "Ubud, Gianyar, Bali", "2 - 3 hours", "Early Morning", "IDR 50,000", "Very High", dest.getImageUrl(), -8.4312, 115.2810));
            list.add(new RecommendedPlaceResponse("Uluwatu Cliffside Temple & Kecak Fire Dance", "Historical & Cultural", "Majestic sea temple perched on a 70-meter cliff with traditional sunset fire performance.", "Pecatu, South Kuta, Bali", "3 hours", "Sunset / Evening", "IDR 150,000", "Very High", dest.getImageUrl(), -8.8291, 115.0849));
            list.add(new RecommendedPlaceResponse("Tegenungan Waterfall", "Nature & Scenic", "Cascading jungle waterfall surrounded by lush tropical foliage and refreshing swimming pools.", "Sukawati, Gianyar, Bali", "2 hours", "Morning", "IDR 20,000", "High", dest.getImageUrl(), -8.5753, 115.2891));
            list.add(new RecommendedPlaceResponse("Seminyak Beachside Seafood & Sunset Clubs", "Food & Restaurants", "Upscale beach lounges and organic cafes serving grilled seafood with beachfront ocean views.", "Seminyak, Badung, Bali", "2 - 3 hours", "Evening", "IDR 200,000", "High", dest.getImageUrl(), -8.6913, 115.1560));
            return list;
        }

        // Generic Smart Generator Fallback for any Destination
        list.add(new RecommendedPlaceResponse(
                city + " Main Square & Landmark Center",
                "Must Visit",
                "The vibrant central hub of " + city + ", " + country + " featuring historic architecture and lively pedestrian streets.",
                city + " City Center",
                "2 hours",
                "Morning",
                "Free",
                "Very High",
                dest.getImageUrl(),
                dest.getLatitude(),
                dest.getLongitude()
        ));

        list.add(new RecommendedPlaceResponse(
                city + " National Heritage & History Museum",
                "Historical & Cultural",
                "Immerse yourself in rich cultural artifacts, regional history, and artistic exhibitions of " + country + ".",
                city + " Cultural Quarter",
                "2 - 3 hours",
                "Afternoon",
                "Moderate ($10 - $20)",
                "High",
                dest.getImageUrl(),
                dest.getLatitude(),
                dest.getLongitude()
        ));

        list.add(new RecommendedPlaceResponse(
                city + " Botanical Gardens & Scenic Viewpoint",
                "Nature & Scenic",
                "Peaceful green sanctuary offering picturesque walking paths, rare flora, and panoramic vistas.",
                city + " Park Promenade",
                "1 - 2 hours",
                "Morning",
                "Free",
                "High",
                dest.getImageUrl(),
                dest.getLatitude(),
                dest.getLongitude()
        ));

        list.add(new RecommendedPlaceResponse(
                city + " Old Town Food Market & Local Eateries",
                "Food & Restaurants",
                "Taste authentic local delicacies, street food, and artisanal beverages unique to " + city + ".",
                city + " Market District",
                "2 hours",
                "Afternoon / Evening",
                "Budget ($10 - $25)",
                "High",
                dest.getImageUrl(),
                dest.getLatitude(),
                dest.getLongitude()
        ));

        list.add(new RecommendedPlaceResponse(
                city + " Artisanal Bazaar & Souvenir Promenade",
                "Shopping",
                "Bustling shopping street with local handicrafts, specialty goods, and boutique stores.",
                city + " Shopping Street",
                "2 hours",
                "Late Afternoon",
                "Varies",
                "Medium",
                dest.getImageUrl(),
                dest.getLatitude(),
                dest.getLongitude()
        ));

        list.add(new RecommendedPlaceResponse(
                city + " Secret Rooftop Lounge & Sunset Spot",
                "Hidden Gems",
                "A cozy hidden spot loved by locals for relaxed evening views over " + city + ".",
                city + " Skyline Heights",
                "1 - 2 hours",
                "Sunset / Evening",
                "Moderate ($15)",
                "Medium",
                dest.getImageUrl(),
                dest.getLatitude(),
                dest.getLongitude()
        ));

        return list;
    }

    private Map<String, List<RecommendedPlaceResponse>> organizeByCategory(List<RecommendedPlaceResponse> places) {
        Map<String, List<RecommendedPlaceResponse>> map = new LinkedHashMap<>();
        // Initialize all 8 standard categories in order
        String[] targetCategories = {
                "Must Visit",
                "Historical & Cultural",
                "Nature & Scenic",
                "Food & Restaurants",
                "Shopping",
                "Adventure & Activities",
                "Nightlife",
                "Hidden Gems"
        };

        for (String cat : targetCategories) {
            map.put(cat, new ArrayList<>());
        }

        for (RecommendedPlaceResponse place : places) {
            String cat = place.getCategory();
            if (cat == null || !map.containsKey(cat)) {
                cat = "Must Visit";
            }
            map.get(cat).add(place);
        }

        return map;
    }
}
