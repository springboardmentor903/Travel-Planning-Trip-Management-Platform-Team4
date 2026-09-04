package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.AddTripMemberRequest;
import com.tripnest.tripnest_backend.dto.ChangeMemberRoleRequest;
import com.tripnest.tripnest_backend.dto.TripMemberResponse;
import com.tripnest.tripnest_backend.entity.MembershipRole;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.NotificationType;
import com.tripnest.tripnest_backend.entity.TripMembership;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.exception.AlreadyTripMemberException;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.exception.TripMemberNotFoundException;
import com.tripnest.tripnest_backend.exception.UnauthorizedTripMembershipOperationException;
import com.tripnest.tripnest_backend.repository.TripMembershipRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TripMembershipService {

    private final TripMembershipRepository tripMembershipRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public TripMemberResponse addMember(Integer tripId, AddTripMemberRequest request, String currentUserEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUserEmail));

        if (!isOwnerOrGroupAdmin(trip, currentUser.getId())) {
            throw new UnauthorizedTripMembershipOperationException("Only trip owners or group admins can add members to this trip");
        }

        User targetUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (tripMembershipRepository.existsByTripIdAndUserId(tripId, targetUser.getId())) {
            throw new AlreadyTripMemberException("User with email " + request.getEmail() + " is already a member of this trip");
        }

        MembershipRole role = request.getRole() != null ? request.getRole() : MembershipRole.MEMBER;

        TripMembership membership = new TripMembership();
        membership.setTrip(trip);
        membership.setUser(targetUser);
        membership.setRole(role);

        TripMembership saved = tripMembershipRepository.save(membership);

        // Create notification ONLY after membership is saved successfully
        notificationService.createNotification(
                targetUser,
                "Added to Trip",
                "You have been added to the trip: " + trip.getTitle(),
                NotificationType.MEMBER_ADDED,
                tripId
        );

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TripMemberResponse> getTripMembers(Integer tripId, String currentUserEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUserEmail));

        boolean isOwner = trip.getUser().getId().equals(currentUser.getId());
        boolean isMember = tripMembershipRepository.existsByTripIdAndUserId(tripId, currentUser.getId());

        if (!isOwner && !isMember) {
            throw new UnauthorizedTripMembershipOperationException("You do not have access to view members of this trip");
        }

        return tripMembershipRepository.findByTripId(tripId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void removeMember(Integer tripId, Integer memberUserId, String currentUserEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUserEmail));

        if (!isOwnerOrGroupAdmin(trip, currentUser.getId())) {
            throw new UnauthorizedTripMembershipOperationException("Only trip owners or group admins can remove members from this trip");
        }

        TripMembership targetMembership = tripMembershipRepository.findByTripIdAndUserId(tripId, memberUserId)
                .orElseThrow(() -> new TripMemberNotFoundException("Trip member not found with user id: " + memberUserId));

        if (trip.getUser().getId().equals(memberUserId)) {
            throw new IllegalArgumentException("Cannot remove the trip owner from the trip");
        }

        if (targetMembership.getRole() == MembershipRole.GROUP_ADMIN) {
            long adminCount = tripMembershipRepository.countByTripIdAndRole(tripId, MembershipRole.GROUP_ADMIN);
            if (adminCount <= 1) {
                throw new IllegalArgumentException("Cannot remove the last GROUP_ADMIN of the trip");
            }
        }

        tripMembershipRepository.delete(targetMembership);
    }

    @Transactional
    public TripMemberResponse changeMemberRole(Integer tripId, Integer memberUserId, ChangeMemberRoleRequest request, String currentUserEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUserEmail));

        if (!isOwnerOrGroupAdmin(trip, currentUser.getId())) {
            throw new UnauthorizedTripMembershipOperationException("Only trip owners or group admins can change member roles");
        }

        if (request.getRole() == null) {
            throw new IllegalArgumentException("Invalid membership role");
        }

        TripMembership targetMembership = tripMembershipRepository.findByTripIdAndUserId(tripId, memberUserId)
                .orElseThrow(() -> new TripMemberNotFoundException("Trip member not found with user id: " + memberUserId));

        if (trip.getUser().getId().equals(memberUserId) && request.getRole() == MembershipRole.MEMBER) {
            throw new IllegalArgumentException("Cannot demote the trip owner from GROUP_ADMIN");
        }

        if (targetMembership.getRole() == MembershipRole.GROUP_ADMIN && request.getRole() == MembershipRole.MEMBER) {
            long adminCount = tripMembershipRepository.countByTripIdAndRole(tripId, MembershipRole.GROUP_ADMIN);
            if (adminCount <= 1) {
                throw new IllegalArgumentException("Cannot demote the last GROUP_ADMIN of the trip");
            }
        }

        targetMembership.setRole(request.getRole());
        TripMembership updated = tripMembershipRepository.save(targetMembership);
        return mapToResponse(updated);
    }

    private boolean isOwnerOrGroupAdmin(Trip trip, Integer userId) {
        if (trip.getUser().getId().equals(userId)) {
            return true;
        }
        return tripMembershipRepository.findByTripIdAndUserId(trip.getId(), userId)
                .map(m -> m.getRole() == MembershipRole.GROUP_ADMIN)
                .orElse(false);
    }

    private TripMemberResponse mapToResponse(TripMembership m) {
        return new TripMemberResponse(
                m.getId(),
                m.getTrip().getId(),
                m.getUser().getId(),
                m.getUser().getName(),
                m.getUser().getEmail(),
                m.getRole(),
                m.getCreatedAt()
        );
    }
}
