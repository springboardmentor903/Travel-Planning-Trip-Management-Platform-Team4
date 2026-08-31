package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.JoinRequestResponse;
import com.tripnest.tripnest_backend.dto.TripSearchResponse;
import com.tripnest.tripnest_backend.entity.*;
import com.tripnest.tripnest_backend.exception.AlreadyTripMemberException;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.exception.UnauthorizedTripMembershipOperationException;
import com.tripnest.tripnest_backend.repository.JoinRequestRepository;
import com.tripnest.tripnest_backend.repository.TripMembershipRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JoinRequestService {

    private final JoinRequestRepository joinRequestRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripMembershipRepository tripMembershipRepository;
    private final TripAccessService tripAccessService;

    @Transactional(readOnly = true)
    public List<TripSearchResponse> searchTripsByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return List.of();
        }
        return tripRepository.findByTitleContainingIgnoreCase(name.trim()).stream()
                .map(this::mapToSearchResponse)
                .toList();
    }

    @Transactional
    public JoinRequestResponse createJoinRequest(Integer tripId, String currentUserEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUserEmail));

        if (trip.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Trip owner cannot request to join their own trip");
        }

        if (tripMembershipRepository.existsByTripIdAndUserId(tripId, user.getId())) {
            throw new AlreadyTripMemberException("User is already a member of this trip");
        }

        if (joinRequestRepository.existsByTripIdAndRequesterIdAndStatus(tripId, user.getId(), JoinRequestStatus.PENDING)) {
            throw new IllegalArgumentException("A pending join request already exists for this trip");
        }

        JoinRequest joinRequest = new JoinRequest();
        joinRequest.setTrip(trip);
        joinRequest.setRequester(user);
        joinRequest.setStatus(JoinRequestStatus.PENDING);

        JoinRequest savedRequest = joinRequestRepository.save(joinRequest);
        return mapToResponse(savedRequest);
    }

    @Transactional(readOnly = true)
    public List<JoinRequestResponse> getPendingJoinRequests(Integer tripId, String currentUserEmail) {
        tripAccessService.validateTripManagement(tripId, currentUserEmail);

        return joinRequestRepository.findByTripIdAndStatus(tripId, JoinRequestStatus.PENDING).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public JoinRequestResponse approveJoinRequest(Integer tripId, Integer requestId, String currentUserEmail) {
        tripAccessService.validateTripManagement(tripId, currentUserEmail);

        User adminUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUserEmail));

        JoinRequest joinRequest = joinRequestRepository.findByIdAndTripId(requestId, tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Join request not found with id: " + requestId + " for trip: " + tripId));

        if (joinRequest.getStatus() != JoinRequestStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING join requests can be approved");
        }

        User requester = joinRequest.getRequester();
        if (!tripMembershipRepository.existsByTripIdAndUserId(tripId, requester.getId())) {
            TripMembership membership = new TripMembership();
            membership.setTrip(joinRequest.getTrip());
            membership.setUser(requester);
            membership.setRole(MembershipRole.MEMBER);
            tripMembershipRepository.save(membership);
        }

        joinRequest.setStatus(JoinRequestStatus.APPROVED);
        joinRequest.setReviewedAt(LocalDateTime.now());
        joinRequest.setReviewedBy(adminUser);

        JoinRequest updatedRequest = joinRequestRepository.save(joinRequest);
        return mapToResponse(updatedRequest);
    }

    @Transactional
    public JoinRequestResponse rejectJoinRequest(Integer tripId, Integer requestId, String currentUserEmail) {
        tripAccessService.validateTripManagement(tripId, currentUserEmail);

        User adminUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUserEmail));

        JoinRequest joinRequest = joinRequestRepository.findByIdAndTripId(requestId, tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Join request not found with id: " + requestId + " for trip: " + tripId));

        if (joinRequest.getStatus() != JoinRequestStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING join requests can be rejected");
        }

        joinRequest.setStatus(JoinRequestStatus.REJECTED);
        joinRequest.setReviewedAt(LocalDateTime.now());
        joinRequest.setReviewedBy(adminUser);

        JoinRequest updatedRequest = joinRequestRepository.save(joinRequest);
        return mapToResponse(updatedRequest);
    }

    @Transactional
    public void cancelJoinRequest(Integer tripId, Integer requestId, String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUserEmail));

        JoinRequest joinRequest = joinRequestRepository.findByIdAndTripId(requestId, tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Join request not found with id: " + requestId + " for trip: " + tripId));

        if (!joinRequest.getRequester().getId().equals(user.getId())) {
            throw new UnauthorizedTripMembershipOperationException("You can only cancel your own join requests");
        }

        if (joinRequest.getStatus() != JoinRequestStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING join requests can be cancelled");
        }

        joinRequest.setStatus(JoinRequestStatus.CANCELLED);
        joinRequestRepository.save(joinRequest);
    }

    private TripSearchResponse mapToSearchResponse(Trip trip) {
        String destName = trip.getDestination() != null ? trip.getDestination().getName() : null;
        String country = trip.getDestination() != null ? trip.getDestination().getCountry() : null;
        Integer ownerId = trip.getUser() != null ? trip.getUser().getId() : null;
        String ownerName = trip.getUser() != null ? trip.getUser().getName() : null;

        return new TripSearchResponse(
                trip.getId(),
                trip.getTitle(),
                destName,
                country,
                trip.getStartDate(),
                trip.getEndDate(),
                ownerId,
                ownerName
        );
    }

    private JoinRequestResponse mapToResponse(JoinRequest r) {
        Integer reviewedById = r.getReviewedBy() != null ? r.getReviewedBy().getId() : null;
        String reviewedByName = r.getReviewedBy() != null ? r.getReviewedBy().getName() : null;

        return new JoinRequestResponse(
                r.getId(),
                r.getTrip().getId(),
                r.getTrip().getTitle(),
                r.getRequester().getId(),
                r.getRequester().getName(),
                r.getRequester().getEmail(),
                r.getStatus(),
                r.getCreatedAt(),
                r.getReviewedAt(),
                reviewedById,
                reviewedByName
        );
    }
}
