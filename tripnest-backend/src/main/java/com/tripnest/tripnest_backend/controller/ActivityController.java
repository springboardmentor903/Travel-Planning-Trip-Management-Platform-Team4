package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.ActivityResponse;
import com.tripnest.tripnest_backend.dto.CreateActivityRequest;
import com.tripnest.tripnest_backend.dto.UpdateActivityRequest;
import com.tripnest.tripnest_backend.service.ActivityService;
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
public class ActivityController {

    private final ActivityService activityService;

    @PostMapping("/itineraries/{dayId}/activities")
    public ResponseEntity<ActivityResponse> createActivity(
            @PathVariable Integer dayId,
            @Valid @RequestBody CreateActivityRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        ActivityResponse response = activityService.createActivity(dayId, request, userEmail);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/itineraries/{dayId}/activities")
    public ResponseEntity<List<ActivityResponse>> getActivities(
            @PathVariable Integer dayId,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        List<ActivityResponse> response = activityService.getActivities(dayId, userEmail);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/itineraries/{dayId}/activities/{activityId}")
    public ResponseEntity<ActivityResponse> updateActivity(
            @PathVariable Integer dayId,
            @PathVariable Integer activityId,
            @Valid @RequestBody UpdateActivityRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        ActivityResponse response = activityService.updateActivity(dayId, activityId, request, userEmail);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/itineraries/{dayId}/activities/{activityId}")
    public ResponseEntity<Void> deleteActivity(
            @PathVariable Integer dayId,
            @PathVariable Integer activityId,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        activityService.deleteActivity(dayId, activityId, userEmail);
        return ResponseEntity.noContent().build();
    }
}
