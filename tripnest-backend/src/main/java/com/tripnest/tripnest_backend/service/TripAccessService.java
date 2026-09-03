package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.entity.MembershipRole;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.exception.UnauthorizedTripMembershipOperationException;
import com.tripnest.tripnest_backend.repository.TripMembershipRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TripAccessService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripMembershipRepository tripMembershipRepository;

    @Transactional(readOnly = true)
    public boolean canAccessTrip(Integer tripId, String userEmail) {
        if (tripId == null || userEmail == null) {
            return false;
        }
        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        Optional<User> userOpt = userRepository.findByEmail(userEmail);

        if (tripOpt.isEmpty() || userOpt.isEmpty()) {
            return false;
        }

        Trip trip = tripOpt.get();
        User user = userOpt.get();

        if (trip.getUser().getId().equals(user.getId())) {
            return true;
        }

        return tripMembershipRepository.existsByTripIdAndUserId(tripId, user.getId());
    }

    @Transactional(readOnly = true)
    public boolean canManageTrip(Integer tripId, String userEmail) {
        if (tripId == null || userEmail == null) {
            return false;
        }
        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        Optional<User> userOpt = userRepository.findByEmail(userEmail);

        if (tripOpt.isEmpty() || userOpt.isEmpty()) {
            return false;
        }

        Trip trip = tripOpt.get();
        User user = userOpt.get();

        if (trip.getUser().getId().equals(user.getId())) {
            return true;
        }

        return tripMembershipRepository.findByTripIdAndUserId(tripId, user.getId())
                .map(membership -> membership.getRole() == MembershipRole.GROUP_ADMIN)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean isTripOwner(Integer tripId, String userEmail) {
        if (tripId == null || userEmail == null) {
            return false;
        }
        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        Optional<User> userOpt = userRepository.findByEmail(userEmail);

        if (tripOpt.isEmpty() || userOpt.isEmpty()) {
            return false;
        }

        return tripOpt.get().getUser().getId().equals(userOpt.get().getId());
    }

    @Transactional(readOnly = true)
    public void validateTripAccess(Integer tripId, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        if (trip.getUser().getId().equals(user.getId())) {
            return;
        }

        boolean isMember = tripMembershipRepository.existsByTripIdAndUserId(tripId, user.getId());
        if (!isMember) {
            throw new UnauthorizedTripMembershipOperationException("Access denied: You do not have access to view this trip");
        }
    }

    @Transactional(readOnly = true)
    public void validateTripManagement(Integer tripId, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        if (trip.getUser().getId().equals(user.getId())) {
            return;
        }

        boolean isGroupAdmin = tripMembershipRepository.findByTripIdAndUserId(tripId, user.getId())
                .map(membership -> membership.getRole() == MembershipRole.GROUP_ADMIN)
                .orElse(false);

        if (!isGroupAdmin) {
            throw new UnauthorizedTripMembershipOperationException("Access denied: Only trip owners or group admins can manage this trip");
        }
    }
}
