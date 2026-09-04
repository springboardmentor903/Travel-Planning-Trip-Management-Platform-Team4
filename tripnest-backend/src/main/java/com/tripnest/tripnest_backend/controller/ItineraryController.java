package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.CreateItineraryDayRequest;
import com.tripnest.tripnest_backend.dto.ItineraryDayResponse;
import com.tripnest.tripnest_backend.dto.UpdateItineraryDayRequest;
import com.tripnest.tripnest_backend.service.ItineraryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ItineraryController {

    private final ItineraryService itineraryService;

    @PostMapping("/trips/{tripId}/itineraries")
    public ResponseEntity<ItineraryDayResponse> createItineraryDay(
            @PathVariable Integer tripId,
            @Valid @RequestBody CreateItineraryDayRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        ItineraryDayResponse response = itineraryService.createItineraryDay(tripId, request, userEmail);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/trips/{tripId}/itineraries")
    public ResponseEntity<List<ItineraryDayResponse>> getItineraryDays(
            @PathVariable Integer tripId,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        List<ItineraryDayResponse> response = itineraryService.getItineraryDays(tripId, userEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/itineraries/{dayId}")
    public ResponseEntity<ItineraryDayResponse> getItineraryDay(
            @PathVariable Integer dayId,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        ItineraryDayResponse response = itineraryService.getItineraryDay(dayId, userEmail);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/itineraries/{dayId}")
    public ResponseEntity<ItineraryDayResponse> updateItineraryDay(
            @PathVariable Integer dayId,
            @Valid @RequestBody UpdateItineraryDayRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        ItineraryDayResponse response = itineraryService.updateItineraryDay(dayId, request, userEmail);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/itineraries/{dayId}")
    public ResponseEntity<Void> deleteItineraryDay(
            @PathVariable Integer dayId,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        itineraryService.deleteItineraryDay(dayId, userEmail);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/trips/{tripId}/itinerary/suggestions")
    public ResponseEntity<com.tripnest.tripnest_backend.dto.ItinerarySuggestionResponse> getItinerarySuggestions(
            @PathVariable Integer tripId,
            @RequestBody(required = false) com.tripnest.tripnest_backend.dto.SmartItineraryRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        com.tripnest.tripnest_backend.dto.ItinerarySuggestionResponse response = itineraryService.getItinerarySuggestions(tripId, request, userEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/trips/{tripId}/itinerary/apply-suggestions")
    public ResponseEntity<List<ItineraryDayResponse>> applyItinerarySuggestions(
            @PathVariable Integer tripId,
            @RequestBody com.tripnest.tripnest_backend.dto.ApplyItinerarySuggestionsRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        List<ItineraryDayResponse> response = itineraryService.applyItinerarySuggestions(tripId, request, userEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/trips/{tripId}/smart-itinerary/generate")
    public ResponseEntity<com.tripnest.tripnest_backend.dto.SmartItineraryResponse> generateSmartItinerary(
            @PathVariable Integer tripId,
            @RequestBody(required = false) com.tripnest.tripnest_backend.dto.SmartItineraryRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        com.tripnest.tripnest_backend.dto.SmartItineraryResponse response = itineraryService.generateSmartItinerary(tripId, request, userEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/trips/{tripId}/smart-itinerary/apply")
    public ResponseEntity<List<ItineraryDayResponse>> applySmartItinerary(
            @PathVariable Integer tripId,
            @RequestBody com.tripnest.tripnest_backend.dto.SmartItineraryResponse suggestions,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        List<ItineraryDayResponse> response = itineraryService.applySmartItinerary(tripId, suggestions, userEmail);
        return ResponseEntity.ok(response);
    }
}
