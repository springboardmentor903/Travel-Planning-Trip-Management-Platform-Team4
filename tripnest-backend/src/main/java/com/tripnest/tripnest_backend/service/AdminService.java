package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.AdminAnalyticsResponse;
import com.tripnest.tripnest_backend.dto.CreateDestinationRequest;
import com.tripnest.tripnest_backend.dto.DestinationAdminDTO;
import com.tripnest.tripnest_backend.dto.DestinationAnalytics;
import com.tripnest.tripnest_backend.dto.DestinationResponse;
import com.tripnest.tripnest_backend.dto.DestinationStatsResponse;
import com.tripnest.tripnest_backend.dto.ExpenseResponse;
import com.tripnest.tripnest_backend.dto.NotificationResponse;
import com.tripnest.tripnest_backend.dto.PageResponse;
import com.tripnest.tripnest_backend.dto.PlatformStats;
import com.tripnest.tripnest_backend.dto.TripAnalytics;
import com.tripnest.tripnest_backend.dto.TripResponse;
import com.tripnest.tripnest_backend.dto.UpdateUserRequest;
import com.tripnest.tripnest_backend.dto.UserAdminDTO;
import com.tripnest.tripnest_backend.dto.UserDetailsDTO;
import com.tripnest.tripnest_backend.dto.UserStatsResponse;
import com.tripnest.tripnest_backend.dto.UserSummaryResponse;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.entity.Expense;
import com.tripnest.tripnest_backend.entity.Notification;
import com.tripnest.tripnest_backend.entity.Role;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.TripStatus;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import com.tripnest.tripnest_backend.repository.ExpenseRepository;
import com.tripnest.tripnest_backend.repository.NotificationRepository;
import com.tripnest.tripnest_backend.repository.RoleRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.tripnest.tripnest_backend.dto.TripAdminDTO;
import com.tripnest.tripnest_backend.dto.TripAdminDetailsDTO;
import com.tripnest.tripnest_backend.dto.TripMonthlyCountDTO;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;
    private final NotificationRepository notificationRepository;
    private final DestinationRepository destinationRepository;

    public AdminAnalyticsResponse getAnalytics() {
        long totalUsers = userRepository.count();

        List<Trip> allTrips = tripRepository.findAll();
        long totalTrips = allTrips.size();
        long cancelledTrips = allTrips.stream().filter(t -> t.getStatus() == TripStatus.CANCELLED).count();

        LocalDate today = LocalDate.now();
        long upcomingTrips = allTrips.stream().filter(t -> t.getStatus() != TripStatus.CANCELLED && t.getStartDate() != null && today.isBefore(t.getStartDate())).count();
        long ongoingTrips = allTrips.stream().filter(t -> t.getStatus() != TripStatus.CANCELLED && t.getStartDate() != null && t.getEndDate() != null && !today.isBefore(t.getStartDate()) && !today.isAfter(t.getEndDate())).count();
        long completedTrips = allTrips.stream().filter(t -> t.getStatus() != TripStatus.CANCELLED && t.getEndDate() != null && today.isAfter(t.getEndDate())).count();

        Double avgBudgetRaw = tripRepository.getAverageTripBudget();
        double averageBudget = avgBudgetRaw != null ? Math.round(avgBudgetRaw * 100.0) / 100.0 : 0.0;

        TripAnalytics tripAnalytics = new TripAnalytics(totalTrips, upcomingTrips, ongoingTrips, completedTrips, cancelledTrips, averageBudget);

        List<DestinationAnalytics> popularDestinations = tripRepository.findTopPopularDestinations(PageRequest.of(0, 5));
        if (popularDestinations == null) {
            popularDestinations = List.of();
        }

        BigDecimal totalExpenses = expenseRepository.getTotalExpenses();
        if (totalExpenses == null) {
            totalExpenses = BigDecimal.ZERO;
        }

        long totalNotifications = notificationRepository.count();
        PlatformStats platformStats = new PlatformStats(totalExpenses, totalNotifications);

        // Trips over time monthly aggregation
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
        Map<String, Long> monthlyGroup = allTrips.stream()
                .filter(t -> t.getStartDate() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getStartDate().format(monthFormatter),
                        Collectors.counting()
                ));

        List<TripMonthlyCountDTO> tripsOverTime = monthlyGroup.entrySet().stream()
                .map(e -> new TripMonthlyCountDTO(e.getKey(), e.getValue()))
                .toList();

        return new AdminAnalyticsResponse(totalUsers, tripAnalytics, popularDestinations, platformStats, tripsOverTime);
    }

    public List<UserSummaryResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserSummaryResponse(u.getId(), u.getName(), u.getEmail(), u.getRole().getName()))
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<UserAdminDTO> getPaginatedUsers(int page, int size, String search, String role, String status, String sortBy, String sortDir) {
        Boolean activeFilter = null;
        if (status != null && !status.trim().isEmpty()) {
            if ("ACTIVE".equalsIgnoreCase(status) || "TRUE".equalsIgnoreCase(status)) {
                activeFilter = true;
            } else if ("DEACTIVATED".equalsIgnoreCase(status) || "INACTIVE".equalsIgnoreCase(status) || "FALSE".equalsIgnoreCase(status)) {
                activeFilter = false;
            }
        }
        String roleFilter = (role != null && !role.trim().isEmpty() && !"ALL".equalsIgnoreCase(role)) ? role.trim() : null;
        String searchFilter = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortProperty = (sortBy != null && !sortBy.trim().isEmpty()) ? sortBy : "createdAt";
        if (!List.of("name", "email", "id", "createdAt").contains(sortProperty)) {
            sortProperty = "createdAt";
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortProperty));
        Page<User> userPage = userRepository.findUsersFiltered(searchFilter, roleFilter, activeFilter, pageable);

        List<UserAdminDTO> content = userPage.getContent().stream().map(u -> {
            long tripCount = tripRepository.countByUserId(u.getId());
            return new UserAdminDTO(
                u.getId(),
                u.getName(),
                u.getEmail(),
                u.getRole() != null ? u.getRole().getName() : null,
                Boolean.TRUE.equals(u.getActive()),
                Boolean.TRUE.equals(u.getOauthGoogle()),
                u.getCreatedAt(),
                tripCount
            );
        }).toList();

        return new PageResponse<>(
            content,
            userPage.getNumber(),
            userPage.getSize(),
            userPage.getTotalElements(),
            userPage.getTotalPages(),
            userPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public UserDetailsDTO getUserDetails(Integer userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        long tripCount = tripRepository.countByUserId(u.getId());
        Double totalBudget = tripRepository.sumBudgetByUserId(u.getId());
        if (totalBudget == null) totalBudget = 0.0;

        List<Trip> recentTrips = tripRepository.findTop5ByUserIdOrderByCreatedAtDesc(u.getId());
        List<TripResponse> recentTripResponses = recentTrips.stream().map(this::mapTripToResponse).toList();

        return new UserDetailsDTO(
            u.getId(),
            u.getName(),
            u.getEmail(),
            u.getRole() != null ? u.getRole().getName() : null,
            Boolean.TRUE.equals(u.getActive()),
            Boolean.TRUE.equals(u.getOauthGoogle()),
            u.getCreatedAt(),
            tripCount,
            totalBudget,
            recentTripResponses
        );
    }

    public UserAdminDTO updateUser(Integer userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use by another account");
        }

        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim());
        User saved = userRepository.save(user);
        long tripCount = tripRepository.countByUserId(saved.getId());

        return new UserAdminDTO(
            saved.getId(),
            saved.getName(),
            saved.getEmail(),
            saved.getRole() != null ? saved.getRole().getName() : null,
            Boolean.TRUE.equals(saved.getActive()),
            Boolean.TRUE.equals(saved.getOauthGoogle()),
            saved.getCreatedAt(),
            tripCount
        );
    }

    public UserAdminDTO updateUserRole(Integer userId, String roleName) {
        return updateUserRole(userId, roleName, null);
    }

    public UserAdminDTO updateUserRole(Integer userId, String roleName, String currentAdminEmail) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (currentAdminEmail != null && currentAdminEmail.equalsIgnoreCase(targetUser.getEmail())) {
            if (!"ADMINISTRATOR".equalsIgnoreCase(roleName)) {
                throw new RuntimeException("You cannot demote your own administrator account");
            }
        }

        Role newRole = roleRepository.findByName(roleName.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Role does not exist: " + roleName));

        targetUser.setRole(newRole);
        User saved = userRepository.save(targetUser);
        long tripCount = tripRepository.countByUserId(saved.getId());

        return new UserAdminDTO(
            saved.getId(),
            saved.getName(),
            saved.getEmail(),
            saved.getRole() != null ? saved.getRole().getName() : null,
            Boolean.TRUE.equals(saved.getActive()),
            Boolean.TRUE.equals(saved.getOauthGoogle()),
            saved.getCreatedAt(),
            tripCount
        );
    }

    public UserAdminDTO updateUserStatus(Integer userId, Boolean active, String currentAdminEmail) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (currentAdminEmail != null && currentAdminEmail.equalsIgnoreCase(targetUser.getEmail()) && !Boolean.TRUE.equals(active)) {
            throw new RuntimeException("You cannot deactivate your own currently logged-in administrator account");
        }

        if (!Boolean.TRUE.equals(active) && "ADMINISTRATOR".equalsIgnoreCase(targetUser.getRole().getName())) {
            long activeAdminCount = userRepository.findAll().stream()
                    .filter(u -> "ADMINISTRATOR".equalsIgnoreCase(u.getRole().getName()) && Boolean.TRUE.equals(u.getActive()))
                    .count();
            if (activeAdminCount <= 1) {
                throw new RuntimeException("Cannot deactivate the sole remaining active administrator");
            }
        }

        targetUser.setActive(active);
        User saved = userRepository.save(targetUser);
        long tripCount = tripRepository.countByUserId(saved.getId());

        return new UserAdminDTO(
            saved.getId(),
            saved.getName(),
            saved.getEmail(),
            saved.getRole() != null ? saved.getRole().getName() : null,
            Boolean.TRUE.equals(saved.getActive()),
            Boolean.TRUE.equals(saved.getOauthGoogle()),
            saved.getCreatedAt(),
            tripCount
        );
    }

    public Map<String, Object> deleteUser(Integer userId, String currentAdminEmail) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (currentAdminEmail != null && currentAdminEmail.equalsIgnoreCase(targetUser.getEmail())) {
            throw new RuntimeException("You cannot delete your own currently logged-in administrator account");
        }

        long tripCount = tripRepository.countByUserId(userId);
        boolean softDeleted = false;

        if (tripCount > 0) {
            targetUser.setActive(false);
            userRepository.save(targetUser);
            softDeleted = true;
        } else {
            userRepository.delete(targetUser);
        }

        return Map.of(
            "userId", userId,
            "deleted", !softDeleted,
            "deactivated", softDeleted,
            "message", softDeleted
                ? "User has " + tripCount + " associated trips. Account has been safely deactivated to preserve trip records."
                : "User account deleted successfully."
        );
    }

    @Transactional(readOnly = true)
    public UserStatsResponse getUserStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByActiveTrue();
        long deactivatedUsers = userRepository.countByActiveFalse();
        long adminCount = userRepository.countByRole_Name("ADMINISTRATOR");
        long travelerCount = userRepository.countByRole_Name("TRAVELER");
        long newUsersThisMonth = userRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(30));

        return new UserStatsResponse(totalUsers, activeUsers, deactivatedUsers, adminCount, travelerCount, newUsersThisMonth);
    }

    /* --- Destination Management Methods --- */

    @Transactional(readOnly = true)
    public PageResponse<DestinationAdminDTO> getPaginatedDestinations(int page, int size, String search, String category, String status, String sortBy, String sortDir) {
        Boolean activeFilter = null;
        if (status != null && !status.trim().isEmpty()) {
            if ("ACTIVE".equalsIgnoreCase(status) || "TRUE".equalsIgnoreCase(status)) {
                activeFilter = true;
            } else if ("DEACTIVATED".equalsIgnoreCase(status) || "INACTIVE".equalsIgnoreCase(status) || "FALSE".equalsIgnoreCase(status)) {
                activeFilter = false;
            }
        }
        String categoryFilter = (category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category)) ? category.trim() : null;
        String searchFilter = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortProperty = (sortBy != null && !sortBy.trim().isEmpty()) ? sortBy : "id";
        if (!List.of("name", "country", "city", "category", "id").contains(sortProperty)) {
            sortProperty = "id";
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortProperty));
        Page<Destination> destPage = destinationRepository.findDestinationsFiltered(searchFilter, categoryFilter, activeFilter, pageable);

        List<DestinationAdminDTO> content = destPage.getContent().stream().map(this::mapDestinationToAdminDTO).toList();

        return new PageResponse<>(
            content,
            destPage.getNumber(),
            destPage.getSize(),
            destPage.getTotalElements(),
            destPage.getTotalPages(),
            destPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public DestinationAdminDTO getDestinationAdminById(Integer id) {
        Destination d = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found with id: " + id));
        return mapDestinationToAdminDTO(d);
    }

    @Transactional(readOnly = true)
    public DestinationStatsResponse getDestinationStats() {
        long total = destinationRepository.count();
        long active = destinationRepository.countByActiveTrue();
        long inactive = destinationRepository.countByActiveFalse();

        List<DestinationAnalytics> popularList = tripRepository.findTopPopularDestinations(PageRequest.of(0, 1));
        String mostPopularName = "None";
        long mostPopularCount = 0;

        if (popularList != null && !popularList.isEmpty()) {
            mostPopularName = popularList.get(0).getDestinationName();
            mostPopularCount = popularList.get(0).getTripCount();
        }

        Map<String, Long> categoryMap = destinationRepository.findAll().stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        d -> (d.getCategory() != null && !d.getCategory().isEmpty()) ? d.getCategory() : "Uncategorized",
                        java.util.stream.Collectors.counting()
                ));

        return new DestinationStatsResponse(total, active, inactive, mostPopularName, mostPopularCount, categoryMap);
    }

    public DestinationAdminDTO createDestination(CreateDestinationRequest request) {
        if (destinationRepository.findByNameIgnoreCase(request.getName().trim()).isPresent()) {
            throw new RuntimeException("A destination with name '" + request.getName() + "' already exists.");
        }

        Destination d = new Destination();
        d.setName(request.getName().trim());
        d.setCountry(request.getCountry().trim());
        d.setCity(request.getCity() != null ? request.getCity().trim() : null);
        d.setDescription(request.getDescription().trim());
        d.setImageUrl(request.getImageUrl() != null && !request.getImageUrl().trim().isEmpty()
                ? request.getImageUrl().trim()
                : "https://images.unsplash.com/photo-1502602898657-3e91760cbb34");
        d.setCategory(request.getCategory().trim());
        d.setLatitude(request.getLatitude());
        d.setLongitude(request.getLongitude());
        d.setEstimatedBudget(request.getEstimatedBudget() != null ? request.getEstimatedBudget() : 0.0);
        d.setBestTravelSeason(request.getBestTravelSeason() != null ? request.getBestTravelSeason().trim() : "Year-round");
        d.setActive(request.getActive() != null ? request.getActive() : true);

        Destination saved = destinationRepository.save(d);
        return mapDestinationToAdminDTO(saved);
    }

    public DestinationAdminDTO updateDestination(Integer id, CreateDestinationRequest request) {
        Destination d = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found with id: " + id));

        Destination existingNameMatch = destinationRepository.findByNameIgnoreCase(request.getName().trim()).orElse(null);
        if (existingNameMatch != null && !existingNameMatch.getId().equals(id)) {
            throw new RuntimeException("A destination with name '" + request.getName() + "' already exists.");
        }

        d.setName(request.getName().trim());
        d.setCountry(request.getCountry().trim());
        d.setCity(request.getCity() != null ? request.getCity().trim() : null);
        d.setDescription(request.getDescription().trim());
        if (request.getImageUrl() != null && !request.getImageUrl().trim().isEmpty()) {
            d.setImageUrl(request.getImageUrl().trim());
        }
        d.setCategory(request.getCategory().trim());
        d.setLatitude(request.getLatitude());
        d.setLongitude(request.getLongitude());
        if (request.getEstimatedBudget() != null) {
            d.setEstimatedBudget(request.getEstimatedBudget());
        }
        if (request.getBestTravelSeason() != null) {
            d.setBestTravelSeason(request.getBestTravelSeason().trim());
        }
        if (request.getActive() != null) {
            d.setActive(request.getActive());
        }

        Destination saved = destinationRepository.save(d);
        return mapDestinationToAdminDTO(saved);
    }

    public DestinationAdminDTO updateDestinationStatus(Integer id, Boolean active) {
        Destination d = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found with id: " + id));

        d.setActive(active != null ? active : true);
        Destination saved = destinationRepository.save(d);
        return mapDestinationToAdminDTO(saved);
    }

    public Map<String, Object> deleteDestination(Integer id) {
        Destination d = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found with id: " + id));

        long tripCount = tripRepository.findAll().stream()
                .filter(t -> t.getDestination() != null && t.getDestination().getId().equals(id))
                .count();

        boolean softDeleted = false;

        if (tripCount > 0) {
            d.setActive(false);
            destinationRepository.save(d);
            softDeleted = true;
        } else {
            destinationRepository.delete(d);
        }

        return Map.of(
            "destinationId", id,
            "deleted", !softDeleted,
            "deactivated", softDeleted,
            "message", softDeleted
                ? "Destination is referenced by " + tripCount + " trips. Destination has been safely deactivated to preserve existing trip itineraries."
                : "Destination deleted successfully."
        );
    }

    private DestinationAdminDTO mapDestinationToAdminDTO(Destination d) {
        long tripCount = tripRepository.findAll().stream()
                .filter(t -> t.getDestination() != null && t.getDestination().getId().equals(d.getId()))
                .count();

        return new DestinationAdminDTO(
            d.getId(),
            d.getName(),
            d.getCountry(),
            d.getCity(),
            d.getDescription(),
            d.getImageUrl(),
            d.getCategory(),
            d.getLatitude(),
            d.getLongitude(),
            Boolean.TRUE.equals(d.getActive()),
            d.getEstimatedBudget() != null ? d.getEstimatedBudget() : 0.0,
            d.getBestTravelSeason() != null ? d.getBestTravelSeason() : "Year-round",
            tripCount
        );
    }

    @Transactional(readOnly = true)
    public List<TripResponse> listTrips(TripStatus status) {
        List<Trip> trips = (status != null)
                ? tripRepository.findByStatusOrderByStartDateDesc(status)
                : tripRepository.findAllByOrderByStartDateDesc();

        return trips.stream().map(this::mapTripToResponse).toList();
    }

    private TripResponse mapTripToResponse(Trip trip) {
        Destination d = trip.getDestination();
        DestinationResponse destinationResponse = null;
        if (d != null) {
            destinationResponse = new DestinationResponse(
                    d.getId(),
                    d.getName(),
                    d.getCountry(),
                    d.getCity(),
                    d.getDescription(),
                    d.getImageUrl(),
                    d.getCategory()
            );
        }

        return new TripResponse(
                trip.getId(),
                trip.getTitle(),
                trip.getUser() != null ? trip.getUser().getId() : null,
                trip.getUser() != null ? trip.getUser().getEmail() : null,
                destinationResponse,
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getBudget(),
                trip.getNotes(),
                trip.getCreatedAt(),
                trip.getStatus()
        );
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> listExpenses() {
        return expenseRepository.findAllByOrderByDateDesc().stream()
                .map(this::mapExpenseToResponse)
                .toList();
    }

    private ExpenseResponse mapExpenseToResponse(Expense e) {
        Integer budgetId = e.getBudget() != null ? e.getBudget().getId() : null;
        Integer payerId = e.getPayer() != null ? e.getPayer().getId() : null;
        String payerName = e.getPayer() != null ? e.getPayer().getName() : null;
        Integer tripId = e.getTrip() != null ? e.getTrip().getId() : null;
        String tripTitle = e.getTrip() != null ? e.getTrip().getTitle() : null;

        return new ExpenseResponse(
                e.getId(),
                tripId,
                budgetId,
                payerId,
                payerName,
                e.getCategory(),
                e.getAmount(),
                e.getDate(),
                e.getReceiptLink(),
                e.getCreatedAt(),
                tripTitle
        );
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> listNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(n -> new NotificationResponse(
                        n.getId(),
                        n.getMessage(),
                        n.getEventKey(),
                        n.getCreatedAt(),
                        n.getUser() != null ? n.getUser().getEmail() : null
                ))
                .toList();
    }

    /* --- Admin Global Trip Management Methods --- */

    private String computeDerivedStatus(Trip t) {
        if (t.getStatus() == TripStatus.CANCELLED) {
            return "CANCELLED";
        }
        LocalDate today = LocalDate.now();
        if (t.getStartDate() != null && today.isBefore(t.getStartDate())) {
            return "UPCOMING";
        } else if (t.getStartDate() != null && t.getEndDate() != null && !today.isBefore(t.getStartDate()) && !today.isAfter(t.getEndDate())) {
            return "ONGOING";
        } else if (t.getEndDate() != null && today.isAfter(t.getEndDate())) {
            return "COMPLETED";
        }
        return t.getStatus() != null ? t.getStatus().name() : "PLANNED";
    }

    @Transactional(readOnly = true)
    public PageResponse<TripAdminDTO> getPaginatedTrips(
            int page,
            int size,
            String search,
            String statusStr,
            Integer destinationId,
            String startDateStr,
            String endDateStr,
            Double minBudget,
            Double maxBudget,
            String sortBy,
            String sortDir
    ) {
        TripStatus status = null;
        if (statusStr != null && !statusStr.trim().isEmpty() && !"ALL".equalsIgnoreCase(statusStr)) {
            try {
                String clean = statusStr.trim().toUpperCase();
                if ("UPCOMING".equals(clean)) status = TripStatus.PLANNED;
                else if ("ONGOING".equals(clean)) status = TripStatus.ACTIVE;
                else status = TripStatus.valueOf(clean);
            } catch (Exception ignored) {}
        }

        LocalDate startDate = null;
        if (startDateStr != null && !startDateStr.trim().isEmpty()) {
            try { startDate = LocalDate.parse(startDateStr.trim()); } catch (Exception ignored) {}
        }

        LocalDate endDate = null;
        if (endDateStr != null && !endDateStr.trim().isEmpty()) {
            try { endDate = LocalDate.parse(endDateStr.trim()); } catch (Exception ignored) {}
        }

        String searchFilter = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortProperty = (sortBy != null && !sortBy.trim().isEmpty()) ? sortBy : "createdAt";
        if (!List.of("startDate", "endDate", "budget", "createdAt", "id").contains(sortProperty)) {
            sortProperty = "createdAt";
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortProperty));
        Page<Trip> tripPage = tripRepository.findTripsFiltered(
                searchFilter, status, destinationId, startDate, endDate, minBudget, maxBudget, pageable
        );

        List<TripAdminDTO> content = tripPage.getContent().stream().map(t -> new TripAdminDTO(
                t.getId(),
                t.getTitle(),
                t.getUser() != null ? t.getUser().getId() : null,
                t.getUser() != null ? t.getUser().getName() : null,
                t.getUser() != null ? t.getUser().getEmail() : null,
                t.getDestination() != null ? t.getDestination().getId() : null,
                t.getDestination() != null ? t.getDestination().getName() : null,
                t.getDestination() != null ? t.getDestination().getCountry() : null,
                t.getDestination() != null ? t.getDestination().getImageUrl() : null,
                t.getStartDate(),
                t.getEndDate(),
                t.getBudget(),
                t.getNotes(),
                t.getStatus(),
                computeDerivedStatus(t),
                t.getCreatedAt()
        )).toList();

        return new PageResponse<>(
                content,
                tripPage.getNumber(),
                tripPage.getSize(),
                tripPage.getTotalElements(),
                tripPage.getTotalPages(),
                tripPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public TripAdminDetailsDTO getTripAdminDetails(Integer tripId) {
        Trip t = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + tripId));

        User u = t.getUser();
        Destination d = t.getDestination();

        DestinationResponse destResponse = null;
        if (d != null) {
            destResponse = new DestinationResponse(
                    d.getId(), d.getName(), d.getCountry(), d.getCity(), d.getDescription(), d.getImageUrl(), d.getCategory()
            );
        }

        return new TripAdminDetailsDTO(
                t.getId(),
                t.getTitle(),
                u != null ? u.getId() : null,
                u != null ? u.getName() : null,
                u != null ? u.getEmail() : null,
                u != null && u.getRole() != null ? u.getRole().getName() : null,
                u != null ? Boolean.TRUE.equals(u.getActive()) : false,
                u != null ? Boolean.TRUE.equals(u.getOauthGoogle()) : false,
                destResponse,
                t.getStartDate(),
                t.getEndDate(),
                t.getBudget(),
                t.getNotes(),
                t.getStatus(),
                computeDerivedStatus(t),
                t.getCreatedAt()
        );
    }

    public TripAdminDTO updateTripStatus(Integer tripId, String statusStr) {
        Trip t = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + tripId));

        try {
            TripStatus newStatus = TripStatus.valueOf(statusStr.toUpperCase());
            t.setStatus(newStatus);
        } catch (Exception e) {
            throw new RuntimeException("Invalid trip status: " + statusStr);
        }

        Trip saved = tripRepository.save(t);
        return new TripAdminDTO(
                saved.getId(),
                saved.getTitle(),
                saved.getUser() != null ? saved.getUser().getId() : null,
                saved.getUser() != null ? saved.getUser().getName() : null,
                saved.getUser() != null ? saved.getUser().getEmail() : null,
                saved.getDestination() != null ? saved.getDestination().getId() : null,
                saved.getDestination() != null ? saved.getDestination().getName() : null,
                saved.getDestination() != null ? saved.getDestination().getCountry() : null,
                saved.getDestination() != null ? saved.getDestination().getImageUrl() : null,
                saved.getStartDate(),
                saved.getEndDate(),
                saved.getBudget(),
                saved.getNotes(),
                saved.getStatus(),
                computeDerivedStatus(saved),
                saved.getCreatedAt()
        );
    }

    public Map<String, Object> deleteTripAdmin(Integer tripId) {
        Trip t = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + tripId));

        tripRepository.delete(t);

        return Map.of(
                "tripId", tripId,
                "deleted", true,
                "message", "Trip #" + tripId + " deleted successfully by administrator."
        );
    }
}


