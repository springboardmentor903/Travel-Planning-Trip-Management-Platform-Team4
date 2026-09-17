package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.AddTripMemberRequest;
import com.tripnest.tripnest_backend.dto.ChangeMemberRoleRequest;
import com.tripnest.tripnest_backend.dto.TripMemberResponse;
import com.tripnest.tripnest_backend.service.TripMembershipService;
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
public class TripMembershipController {

    private final TripMembershipService tripMembershipService;

    @PostMapping("/{tripId}/members")
    public ResponseEntity<TripMemberResponse> addMember(
            @PathVariable Integer tripId,
            @Valid @RequestBody AddTripMemberRequest request,
            Authentication authentication
    ) {
        String currentUserEmail = authentication.getName();
        TripMemberResponse response = tripMembershipService.addMember(tripId, request, currentUserEmail);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{tripId}/members")
    public ResponseEntity<List<TripMemberResponse>> getMembers(
            @PathVariable Integer tripId,
            Authentication authentication
    ) {
        String currentUserEmail = authentication.getName();
        List<TripMemberResponse> response = tripMembershipService.getTripMembers(tripId, currentUserEmail);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{tripId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Integer tripId,
            @PathVariable Integer userId,
            Authentication authentication
    ) {
        String currentUserEmail = authentication.getName();
        tripMembershipService.removeMember(tripId, userId, currentUserEmail);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{tripId}/members/{userId}/role")
    public ResponseEntity<TripMemberResponse> changeMemberRole(
            @PathVariable Integer tripId,
            @PathVariable Integer userId,
            @Valid @RequestBody ChangeMemberRoleRequest request,
            Authentication authentication
    ) {
        String currentUserEmail = authentication.getName();
        TripMemberResponse response = tripMembershipService.changeMemberRole(tripId, userId, request, currentUserEmail);
        return ResponseEntity.ok(response);
    }
}
