package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.entity.*;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.exception.UnauthorizedTripMembershipOperationException;
import com.tripnest.tripnest_backend.repository.TripMembershipRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TripAccessServiceTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TripMembershipRepository tripMembershipRepository;

    @InjectMocks
    private TripAccessService tripAccessService;

    private User owner;
    private User regularMemberUser;
    private User groupAdminUser;
    private User nonMemberUser;
    private Trip trip;

    @BeforeEach
    void setUp() {
        Role role = new Role(1, "TRAVELER");
        owner = new User(1, "Owner", "owner@example.com", "hash", role, false, LocalDateTime.now());
        regularMemberUser = new User(2, "Member User", "member@example.com", "hash", role, false, LocalDateTime.now());
        groupAdminUser = new User(3, "Admin User", "admin@example.com", "hash", role, false, LocalDateTime.now());
        nonMemberUser = new User(4, "Non Member", "nonmember@example.com", "hash", role, false, LocalDateTime.now());

        Destination destination = new Destination(1, "Tokyo", "Japan", "Tokyo", "Desc", "url", "City");
        trip = new Trip(10, "Tokyo Trip", owner, destination, LocalDate.now().plusDays(1), LocalDate.now().plusDays(5), 2000.0, "Notes", LocalDateTime.now());
    }

    // 1. Owner -> true
    @Test
    void testCanAccessTrip_Owner_ReturnsTrue() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));

        assertTrue(tripAccessService.canAccessTrip(10, "owner@example.com"));
        assertDoesNotThrow(() -> tripAccessService.validateTripAccess(10, "owner@example.com"));
    }

    // 2. Member -> true
    @Test
    void testCanAccessTrip_Member_ReturnsTrue() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(regularMemberUser));
        when(tripMembershipRepository.existsByTripIdAndUserId(10, 2)).thenReturn(true);

        assertTrue(tripAccessService.canAccessTrip(10, "member@example.com"));
        assertDoesNotThrow(() -> tripAccessService.validateTripAccess(10, "member@example.com"));
    }

    // 3. Non-member -> false / throws 403
    @Test
    void testCanAccessTrip_NonMember_ReturnsFalseAndThrowsForbidden() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("nonmember@example.com")).thenReturn(Optional.of(nonMemberUser));
        when(tripMembershipRepository.existsByTripIdAndUserId(10, 4)).thenReturn(false);

        assertFalse(tripAccessService.canAccessTrip(10, "nonmember@example.com"));
        assertThrows(UnauthorizedTripMembershipOperationException.class,
                () -> tripAccessService.validateTripAccess(10, "nonmember@example.com"));
    }

    // 4. Unknown user -> false / throws 404
    @Test
    void testCanAccessTrip_UnknownUser_ThrowsNotFound() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertFalse(tripAccessService.canAccessTrip(10, "unknown@example.com"));
        assertThrows(ResourceNotFoundException.class,
                () -> tripAccessService.validateTripAccess(10, "unknown@example.com"));
    }

    // 5. Unknown trip -> false / throws 404
    @Test
    void testCanAccessTrip_UnknownTrip_ThrowsNotFound() {
        when(tripRepository.findById(999)).thenReturn(Optional.empty());

        assertFalse(tripAccessService.canAccessTrip(999, "owner@example.com"));
        assertThrows(ResourceNotFoundException.class,
                () -> tripAccessService.validateTripAccess(999, "owner@example.com"));
    }

    // 6. Regular Member attempting Management -> false / throws 403
    @Test
    void testCanManageTrip_RegularMember_ReturnsFalseAndThrowsForbidden() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(regularMemberUser));

        TripMembership memberShip = new TripMembership(1, trip, regularMemberUser, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 2)).thenReturn(Optional.of(memberShip));

        assertFalse(tripAccessService.canManageTrip(10, "member@example.com"));
        assertThrows(UnauthorizedTripMembershipOperationException.class,
                () -> tripAccessService.validateTripManagement(10, "member@example.com"));
    }

    // 7. Group Admin attempting Management -> true
    @Test
    void testCanManageTrip_GroupAdmin_ReturnsTrue() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(groupAdminUser));

        TripMembership adminShip = new TripMembership(2, trip, groupAdminUser, MembershipRole.GROUP_ADMIN, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 3)).thenReturn(Optional.of(adminShip));

        assertTrue(tripAccessService.canManageTrip(10, "admin@example.com"));
        assertDoesNotThrow(() -> tripAccessService.validateTripManagement(10, "admin@example.com"));
    }
}
