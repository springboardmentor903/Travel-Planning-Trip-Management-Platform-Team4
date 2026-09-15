package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.PlaceItemResponse;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GooglePlacesService {

    private final DestinationRepository destinationRepository;
    private final OsmOverpassPlacesService osmOverpassPlacesService;

    @Value("${google.places.api.key:}")
    private String googlePlacesApiKey;

    private static final String PLACES_TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";

    public List<PlaceItemResponse> getPlacesForDestination(Integer destinationId) {
        if (destinationId == null || destinationId <= 0) {
            throw new IllegalArgumentException("Destination ID must be a positive integer");
        }

        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + destinationId));

        // If Google Places API key is missing, delegate directly to OpenStreetMap + Overpass API
        if (googlePlacesApiKey == null || googlePlacesApiKey.trim().isEmpty()) {
            log.info("Google Places API key is not configured. Fetching attractions via OpenStreetMap + Overpass API for destination: {}", destination.getName());
            return osmOverpassPlacesService.getPlacesForDestination(destinationId);
        }

        String searchQuery = "tourist attractions in " + destination.getName() +
                (destination.getCountry() != null ? " " + destination.getCountry() : "");

        try {
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(4000);
            factory.setReadTimeout(4000);
            RestTemplate restTemplate = new RestTemplate(factory);

            String url = UriComponentsBuilder.fromUriString(PLACES_TEXT_SEARCH_URL)
                    .queryParam("query", searchQuery)
                    .queryParam("key", googlePlacesApiKey)
                    .toUriString();

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null || !response.containsKey("results")) {
                return osmOverpassPlacesService.getPlacesForDestination(destinationId);
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            if (results == null || results.isEmpty()) {
                return osmOverpassPlacesService.getPlacesForDestination(destinationId);
            }

            List<PlaceItemResponse> placeItems = new ArrayList<>();
            for (Map<String, Object> item : results) {
                placeItems.add(mapToPlaceItemResponse(item));
            }

            return placeItems;
        } catch (Exception ex) {
            log.warn("Google Places API query failed for {}: {}. Falling back to OpenStreetMap + Overpass API.", destination.getName(), ex.getMessage());
            return osmOverpassPlacesService.getPlacesForDestination(destinationId);
        }
    }

    private PlaceItemResponse mapToPlaceItemResponse(Map<String, Object> item) {
        String id = item.get("place_id") != null ? String.valueOf(item.get("place_id")) : null;
        String name = item.get("name") != null ? String.valueOf(item.get("name")) : "Unknown Place";
        String address = item.get("formatted_address") != null ? String.valueOf(item.get("formatted_address")) : null;

        Double rating = null;
        if (item.get("rating") instanceof Number num) {
            rating = num.doubleValue();
        }

        Integer userRatingsTotal = null;
        if (item.get("user_ratings_total") instanceof Number num) {
            userRatingsTotal = num.intValue();
        }

        String category = "Attraction";
        if (item.get("types") instanceof List<?> types && !types.isEmpty()) {
            category = formatCategory(String.valueOf(types.get(0)));
        }

        return new PlaceItemResponse(
                id,
                name,
                category,
                address,
                rating,
                userRatingsTotal,
                null
        );
    }

    private String formatCategory(String rawType) {
        if (rawType == null || rawType.isEmpty()) return "Attraction";
        String formatted = rawType.replace("_", " ");
        return Character.toUpperCase(formatted.charAt(0)) + formatted.substring(1);
    }
}
