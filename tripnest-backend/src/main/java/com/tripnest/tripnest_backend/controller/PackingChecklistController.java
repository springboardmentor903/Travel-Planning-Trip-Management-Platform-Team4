package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.*;
import com.tripnest.tripnest_backend.service.PackingChecklistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/trips/{tripId}/packing")
@RequiredArgsConstructor
public class PackingChecklistController {

    private final PackingChecklistService packingChecklistService;

    @GetMapping
    public ResponseEntity<PackingChecklistResponse> getPackingChecklist(
            @PathVariable Integer tripId,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        PackingChecklistResponse response = packingChecklistService.getOrGeneratePackingChecklist(tripId, userEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/regenerate")
    public ResponseEntity<PackingChecklistResponse> regeneratePackingChecklist(
            @PathVariable Integer tripId,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        PackingChecklistResponse response = packingChecklistService.regeneratePackingChecklist(tripId, userEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/items")
    public ResponseEntity<PackingItemDTO> addCustomItem(
            @PathVariable Integer tripId,
            @Valid @RequestBody CreatePackingItemRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        PackingItemDTO response = packingChecklistService.addCustomItem(tripId, request, userEmail);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PatchMapping("/items/{itemId}")
    public ResponseEntity<PackingItemDTO> updateItem(
            @PathVariable Integer tripId,
            @PathVariable Integer itemId,
            @RequestBody UpdatePackingItemRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        PackingItemDTO response = packingChecklistService.updateItem(tripId, itemId, request, userEmail);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Map<String, String>> deleteItem(
            @PathVariable Integer tripId,
            @PathVariable Integer itemId,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        packingChecklistService.deleteItem(tripId, itemId, userEmail);
        return ResponseEntity.ok(Map.of("message", "Packing item deleted successfully"));
    }
}
