package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.AdminAnalyticsResponse;
import com.tripnest.tripnest_backend.dto.CreateDestinationRequest;
import com.tripnest.tripnest_backend.dto.DestinationAdminDTO;
import com.tripnest.tripnest_backend.dto.DestinationStatsResponse;
import com.tripnest.tripnest_backend.dto.ExpenseResponse;
import com.tripnest.tripnest_backend.dto.NotificationResponse;
import com.tripnest.tripnest_backend.dto.PageResponse;
import com.tripnest.tripnest_backend.dto.TripAdminDTO;
import com.tripnest.tripnest_backend.dto.TripAdminDetailsDTO;
import com.tripnest.tripnest_backend.dto.TripResponse;
import com.tripnest.tripnest_backend.dto.UpdateRoleRequest;
import com.tripnest.tripnest_backend.dto.UpdateStatusRequest;
import com.tripnest.tripnest_backend.dto.UpdateUserRequest;
import com.tripnest.tripnest_backend.dto.UserAdminDTO;
import com.tripnest.tripnest_backend.dto.UserDetailsDTO;
import com.tripnest.tripnest_backend.dto.UserStatsResponse;
import com.tripnest.tripnest_backend.dto.UserSummaryResponse;
import com.tripnest.tripnest_backend.entity.TripStatus;
import com.tripnest.tripnest_backend.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/analytics")
    public ResponseEntity<AdminAnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(adminService.getAnalytics());
    }

    @GetMapping("/dashboard")
    public String adminDashboard(Authentication authentication) {
        return "Welcome, Administrator " + authentication.getName() + "! This is the admin-only dashboard.";
    }

    // User Management Endpoints

    @GetMapping("/users")
    public ResponseEntity<PageResponse<UserAdminDTO>> getPaginatedUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        return ResponseEntity.ok(adminService.getPaginatedUsers(page, size, search, role, status, sortBy, sortDir));
    }

    @GetMapping("/users/stats")
    public ResponseEntity<UserStatsResponse> getUserStats() {
        return ResponseEntity.ok(adminService.getUserStats());
    }

    @GetMapping("/users/all-summary")
    public List<UserSummaryResponse> listUsersSummary() {
        return adminService.listUsers();
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDetailsDTO> getUserDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.getUserDetails(id));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserAdminDTO> updateUser(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return ResponseEntity.ok(adminService.updateUser(id, request));
    }

    @RequestMapping(value = "/users/{id}/role", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<UserAdminDTO> updateUserRole(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateRoleRequest request,
            Authentication authentication
    ) {
        String adminEmail = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(adminService.updateUserRole(id, request.getRoleName(), adminEmail));
    }

    @RequestMapping(value = "/users/{id}/status", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<UserAdminDTO> updateUserStatus(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateStatusRequest request,
            Authentication authentication
    ) {
        String adminEmail = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(adminService.updateUserStatus(id, request.getActive(), adminEmail));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        String adminEmail = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(adminService.deleteUser(id, adminEmail));
    }

    // Destination Management Endpoints

    @GetMapping("/destinations")
    public ResponseEntity<PageResponse<DestinationAdminDTO>> getPaginatedDestinations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        return ResponseEntity.ok(adminService.getPaginatedDestinations(page, size, search, category, status, sortBy, sortDir));
    }

    @GetMapping("/destinations/stats")
    public ResponseEntity<DestinationStatsResponse> getDestinationStats() {
        return ResponseEntity.ok(adminService.getDestinationStats());
    }

    @GetMapping("/destinations/{id}")
    public ResponseEntity<DestinationAdminDTO> getDestinationById(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.getDestinationAdminById(id));
    }

    @PostMapping("/destinations")
    public ResponseEntity<DestinationAdminDTO> createDestination(@Valid @RequestBody CreateDestinationRequest request) {
        return ResponseEntity.ok(adminService.createDestination(request));
    }

    @PutMapping("/destinations/{id}")
    public ResponseEntity<DestinationAdminDTO> updateDestination(
            @PathVariable Integer id,
            @Valid @RequestBody CreateDestinationRequest request
    ) {
        return ResponseEntity.ok(adminService.updateDestination(id, request));
    }

    @RequestMapping(value = "/destinations/{id}/status", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<DestinationAdminDTO> updateDestinationStatus(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        return ResponseEntity.ok(adminService.updateDestinationStatus(id, request.getActive()));
    }

    @DeleteMapping("/destinations/{id}")
    public ResponseEntity<Map<String, Object>> deleteDestination(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.deleteDestination(id));
    }

    // Admin Trip Management Endpoints

    @GetMapping("/trips")
    public ResponseEntity<PageResponse<TripAdminDTO>> getPaginatedTrips(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer destination,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Double minBudget,
            @RequestParam(required = false) Double maxBudget,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        return ResponseEntity.ok(adminService.getPaginatedTrips(
                page, size, search, status, destination, startDate, endDate, minBudget, maxBudget, sortBy, sortDir
        ));
    }

    @GetMapping("/trips/{id}")
    public ResponseEntity<TripAdminDetailsDTO> getTripById(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.getTripAdminDetails(id));
    }

    @RequestMapping(value = "/trips/{id}/status", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<TripAdminDTO> updateTripStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body
    ) {
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new RuntimeException("Field 'status' is required.");
        }
        return ResponseEntity.ok(adminService.updateTripStatus(id, newStatus.trim()));
    }

    @DeleteMapping("/trips/{id}")
    public ResponseEntity<Map<String, Object>> deleteTrip(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.deleteTripAdmin(id));
    }

    // Expenses, Notifications

    @GetMapping("/expenses")
    public List<ExpenseResponse> listExpenses() {
        return adminService.listExpenses();
    }

    @GetMapping("/notifications")
    public List<NotificationResponse> listNotifications() {
        return adminService.listNotifications();
    }
}
