package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.CreateTripRequest;
import com.tripnest.tripnest_backend.dto.TripResponse;
import com.tripnest.tripnest_backend.dto.UpdateTripRequest;
import com.tripnest.tripnest_backend.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody CreateTripRequest request, Authentication authentication) {
        String userEmail = authentication.getName();
        TripResponse response = tripService.createTrip(request, userEmail);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TripResponse>> getUserTrips(Authentication authentication) {
        String userEmail = authentication.getName();
        List<TripResponse> trips = tripService.getUserTrips(userEmail);
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripResponse> getTripById(@PathVariable Integer id, Authentication authentication) {
        String userEmail = authentication.getName();
        TripResponse response = tripService.getTripById(id, userEmail);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripResponse> updateTrip(@PathVariable Integer id, @Valid @RequestBody UpdateTripRequest request, Authentication authentication) {
        String userEmail = authentication.getName();
        TripResponse response = tripService.updateTrip(id, request, userEmail);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Integer id, Authentication authentication) {
        String userEmail = authentication.getName();
        tripService.deleteTrip(id, userEmail);
        return ResponseEntity.noContent().build();
    }
}
