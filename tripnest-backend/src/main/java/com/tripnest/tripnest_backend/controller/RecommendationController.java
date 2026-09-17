package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.DestinationRecommendationResponse;
import com.tripnest.tripnest_backend.service.DestinationRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RecommendationController {

    private final DestinationRecommendationService destinationRecommendationService;

    @GetMapping("/trips/{tripId}/recommendations")
    public ResponseEntity<DestinationRecommendationResponse> getRecommendationsForTrip(
            @PathVariable Integer tripId,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        DestinationRecommendationResponse response = destinationRecommendationService.getRecommendationsForTrip(tripId, userEmail);
        return ResponseEntity.ok(response);
    }
}
