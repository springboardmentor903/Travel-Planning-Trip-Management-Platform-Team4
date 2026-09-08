package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.DestinationResponse;
import com.tripnest.tripnest_backend.dto.PlaceItemResponse;
import com.tripnest.tripnest_backend.dto.WeatherResponse;
import com.tripnest.tripnest_backend.service.DestinationService;
import com.tripnest.tripnest_backend.service.GooglePlacesService;
import com.tripnest.tripnest_backend.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.tripnest.tripnest_backend.dto.DestinationResponse;
import com.tripnest.tripnest_backend.dto.AttractionResponse;
import com.tripnest.tripnest_backend.dto.CreateAttractionRequest;
import com.tripnest.tripnest_backend.dto.PlaceItemResponse;
import com.tripnest.tripnest_backend.dto.WeatherResponse;
import com.tripnest.tripnest_backend.service.DestinationService;
import com.tripnest.tripnest_backend.service.AttractionService;
import com.tripnest.tripnest_backend.service.GooglePlacesService;
import com.tripnest.tripnest_backend.service.WeatherService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
public class DestinationController {

    private final DestinationService destinationService;
    private final AttractionService attractionService;
    private final WeatherService weatherService;
    private final GooglePlacesService googlePlacesService;

    @GetMapping
    public ResponseEntity<List<DestinationResponse>> getAllDestinations() {
        List<DestinationResponse> destinations = destinationService.getAllDestinations();
        return ResponseEntity.ok(destinations);
    }

    @GetMapping("/popular")
    public ResponseEntity<List<DestinationResponse>> getPopularDestinations() {
        List<DestinationResponse> popularDestinations = destinationService.getPopularDestinations();
        return ResponseEntity.ok(popularDestinations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DestinationResponse> getDestinationById(@PathVariable Integer id) {
        DestinationResponse destination = destinationService.getDestinationById(id);
        return ResponseEntity.ok(destination);
    }

    @GetMapping("/{id}/attractions")
    public ResponseEntity<List<AttractionResponse>> getAttractions(@PathVariable Integer id) {
        return ResponseEntity.ok(attractionService.getByDestination(id));
    }

    @PostMapping("/{id}/attractions")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<AttractionResponse> createAttraction(
            @PathVariable Integer id,
            @Valid @RequestBody CreateAttractionRequest request) {
        return ResponseEntity.status(201).body(attractionService.create(id, request));
    }

    @GetMapping("/{id}/weather")
    public ResponseEntity<WeatherResponse> getDestinationWeather(@PathVariable Integer id) {
        WeatherResponse weather = weatherService.getWeatherForDestination(id);
        return ResponseEntity.ok(weather);
    }

    @GetMapping("/{id}/places")
    public ResponseEntity<List<PlaceItemResponse>> getDestinationPlaces(@PathVariable Integer id) {
        List<PlaceItemResponse> places = googlePlacesService.getPlacesForDestination(id);
        return ResponseEntity.ok(places);
    }
}