package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.PlaceItemResponse;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.exception.ExternalServiceException;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GooglePlacesService {

    private final DestinationRepository destinationRepository;

    @Value("${google.places.api.key:}")
    private String googlePlacesApiKey;

    private static final String PLACES_TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";

    public List<PlaceItemResponse> getPlacesForDestination(Integer destinationId) {
        if (destinationId == null || destinationId <= 0) {
            throw new IllegalArgumentException("Destination ID must be a positive integer");
        }

        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + destinationId));

        if (googlePlacesApiKey == null || googlePlacesApiKey.trim().isEmpty()) {
            throw new ExternalServiceException("Google Places API key is not configured on the backend. Please set the GOOGLE_PLACES_API_KEY environment variable.");
        }

        String searchQuery = "tourist attractions in " + destination.getName() +
                (destination.getCountry() != null ? " " + destination.getCountry() : "");

        try {
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(5000);
            factory.setReadTimeout(5000);
            RestTemplate restTemplate = new RestTemplate(factory);

            String url = UriComponentsBuilder.fromUriString(PLACES_TEXT_SEARCH_URL)
                    .queryParam("query", searchQuery)
                    .queryParam("key", googlePlacesApiKey)
                    .toUriString();

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null || !response.containsKey("results")) {
                return List.of();
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            if (results == null || results.isEmpty()) {
                return List.of();
            }

            List<PlaceItemResponse> placeItems = new ArrayList<>();
            for (Map<String, Object> item : results) {
                placeItems.add(mapToPlaceItemResponse(item));
            }

            return placeItems;
        } catch (ExternalServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ExternalServiceException("Failed to fetch Google Places data for " + destination.getName() + ": " + ex.getMessage(), ex);
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
