package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.JoinRequestResponse;
import com.tripnest.tripnest_backend.dto.TripSearchResponse;
import com.tripnest.tripnest_backend.service.JoinRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class JoinRequestController {

    private final JoinRequestService joinRequestService;

    @GetMapping("/search")
    public ResponseEntity<List<TripSearchResponse>> searchTrips(@RequestParam(required = false, defaultValue = "") String name) {
        List<TripSearchResponse> results = joinRequestService.searchTripsByName(name);
        return ResponseEntity.ok(results);
    }

    @PostMapping("/{tripId}/join-requests")
    public ResponseEntity<JoinRequestResponse> createJoinRequest(
            @PathVariable Integer tripId,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        JoinRequestResponse response = joinRequestService.createJoinRequest(tripId, userEmail);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{tripId}/join-requests")
    public ResponseEntity<List<JoinRequestResponse>> getPendingJoinRequests(
            @PathVariable Integer tripId,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        List<JoinRequestResponse> requests = joinRequestService.getPendingJoinRequests(tripId, userEmail);
        return ResponseEntity.ok(requests);
    }

    @PatchMapping("/{tripId}/join-requests/{requestId}/approve")
    public ResponseEntity<JoinRequestResponse> approveJoinRequest(
            @PathVariable Integer tripId,
            @PathVariable Integer requestId,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        JoinRequestResponse response = joinRequestService.approveJoinRequest(tripId, requestId, userEmail);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{tripId}/join-requests/{requestId}/reject")
    public ResponseEntity<JoinRequestResponse> rejectJoinRequest(
            @PathVariable Integer tripId,
            @PathVariable Integer requestId,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        JoinRequestResponse response = joinRequestService.rejectJoinRequest(tripId, requestId, userEmail);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{tripId}/join-requests/{requestId}")
    public ResponseEntity<Void> cancelJoinRequest(
            @PathVariable Integer tripId,
            @PathVariable Integer requestId,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        joinRequestService.cancelJoinRequest(tripId, requestId, userEmail);
        return ResponseEntity.noContent().build();
    }
}
