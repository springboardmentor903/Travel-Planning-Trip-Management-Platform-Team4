package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.AddTripMemberRequest;
import com.tripnest.tripnest_backend.dto.ChangeMemberRoleRequest;
import com.tripnest.tripnest_backend.dto.TripMemberResponse;
import com.tripnest.tripnest_backend.entity.*;
import com.tripnest.tripnest_backend.exception.AlreadyTripMemberException;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.exception.TripMemberNotFoundException;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TripMembershipServiceTest {

    @Mock
    private TripMembershipRepository tripMembershipRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TripMembershipService tripMembershipService;

    private User owner;
    private User adminMember;
    private User regularMember;
    private User newTargetUser;
    private Trip trip;
    private Destination destination;

    @BeforeEach
    void setUp() {
        Role role = new Role(1, "TRAVELER");
        owner = new User(1, "Owner", "owner@example.com", "hash", role, false, LocalDateTime.now());
        adminMember = new User(2, "Admin Member", "admin@example.com", "hash", role, false, LocalDateTime.now());
        regularMember = new User(3, "Regular Member", "regular@example.com", "hash", role, false, LocalDateTime.now());
        newTargetUser = new User(4, "Target User", "target@example.com", "hash", role, false, LocalDateTime.now());

        destination = new Destination(1, "Paris", "France", "Paris", "Desc", "url", "City");
        trip = new Trip(10, "Summer Trip", owner, destination, LocalDate.now().plusDays(1), LocalDate.now().plusDays(5), 1000.0, "Notes", LocalDateTime.now());
    }

    // 1. Owner adds member
    @Test
    void testOwnerAddsMember_Success() {
        AddTripMemberRequest request = new AddTripMemberRequest("target@example.com", MembershipRole.MEMBER);

        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(userRepository.findByEmail("target@example.com")).thenReturn(Optional.of(newTargetUser));
        when(tripMembershipRepository.existsByTripIdAndUserId(10, 4)).thenReturn(false);

        TripMembership savedMembership = new TripMembership(100, trip, newTargetUser, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.save(any(TripMembership.class))).thenReturn(savedMembership);

        TripMemberResponse response = tripMembershipService.addMember(10, request, "owner@example.com");

        assertNotNull(response);
        assertEquals(4, response.getUserId());
        assertEquals(MembershipRole.MEMBER, response.getRole());
        verify(tripMembershipRepository, times(1)).save(any(TripMembership.class));
    }

    // 2. Group Admin adds member
    @Test
    void testGroupAdminAddsMember_Success() {
        AddTripMemberRequest request = new AddTripMemberRequest("target@example.com", MembershipRole.MEMBER);

        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminMember));
        TripMembership adminMembership = new TripMembership(20, trip, adminMember, MembershipRole.GROUP_ADMIN, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 2)).thenReturn(Optional.of(adminMembership));
        when(userRepository.findByEmail("target@example.com")).thenReturn(Optional.of(newTargetUser));
        when(tripMembershipRepository.existsByTripIdAndUserId(10, 4)).thenReturn(false);

        TripMembership savedMembership = new TripMembership(101, trip, newTargetUser, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.save(any(TripMembership.class))).thenReturn(savedMembership);

        TripMemberResponse response = tripMembershipService.addMember(10, request, "admin@example.com");

        assertNotNull(response);
        assertEquals(4, response.getUserId());
        verify(tripMembershipRepository, times(1)).save(any(TripMembership.class));
    }

    // 3. Regular member attempts to add member -> 403
    @Test
    void testRegularMemberAddsMember_ThrowsForbidden() {
        AddTripMemberRequest request = new AddTripMemberRequest("target@example.com", MembershipRole.MEMBER);

        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("regular@example.com")).thenReturn(Optional.of(regularMember));
        TripMembership regMembership = new TripMembership(30, trip, regularMember, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 3)).thenReturn(Optional.of(regMembership));

        assertThrows(UnauthorizedTripMembershipOperationException.class,
                () -> tripMembershipService.addMember(10, request, "regular@example.com"));
    }

    // 4. List members
    @Test
    void testGetTripMembers_Success() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));

        TripMembership m1 = new TripMembership(1, trip, owner, MembershipRole.GROUP_ADMIN, LocalDateTime.now());
        TripMembership m2 = new TripMembership(2, trip, regularMember, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.findByTripId(10)).thenReturn(List.of(m1, m2));

        List<TripMemberResponse> members = tripMembershipService.getTripMembers(10, "owner@example.com");

        assertEquals(2, members.size());
    }

    // 5. Owner removes member
    @Test
    void testOwnerRemovesMember_Success() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));

        TripMembership regMembership = new TripMembership(30, trip, regularMember, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 3)).thenReturn(Optional.of(regMembership));

        tripMembershipService.removeMember(10, 3, "owner@example.com");

        verify(tripMembershipRepository, times(1)).delete(regMembership);
    }

    // 6. Group Admin removes member
    @Test
    void testGroupAdminRemovesMember_Success() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminMember));
        TripMembership adminMembership = new TripMembership(20, trip, adminMember, MembershipRole.GROUP_ADMIN, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 2)).thenReturn(Optional.of(adminMembership));

        TripMembership regMembership = new TripMembership(30, trip, regularMember, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 3)).thenReturn(Optional.of(regMembership));

        tripMembershipService.removeMember(10, 3, "admin@example.com");

        verify(tripMembershipRepository, times(1)).delete(regMembership);
    }

    // 7. Regular member attempts removal -> 403
    @Test
    void testRegularMemberRemovesMember_ThrowsForbidden() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("regular@example.com")).thenReturn(Optional.of(regularMember));
        TripMembership regMembership = new TripMembership(30, trip, regularMember, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 3)).thenReturn(Optional.of(regMembership));

        assertThrows(UnauthorizedTripMembershipOperationException.class,
                () -> tripMembershipService.removeMember(10, 2, "regular@example.com"));
    }

    // 8. Owner changes role
    @Test
    void testOwnerChangesRole_Success() {
        ChangeMemberRoleRequest request = new ChangeMemberRoleRequest(MembershipRole.GROUP_ADMIN);

        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));

        TripMembership regMembership = new TripMembership(30, trip, regularMember, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 3)).thenReturn(Optional.of(regMembership));
        when(tripMembershipRepository.save(any(TripMembership.class))).thenReturn(regMembership);

        TripMemberResponse response = tripMembershipService.changeMemberRole(10, 3, request, "owner@example.com");

        assertNotNull(response);
        assertEquals(MembershipRole.GROUP_ADMIN, response.getRole());
    }

    // 9. Group Admin changes role
    @Test
    void testGroupAdminChangesRole_Success() {
        ChangeMemberRoleRequest request = new ChangeMemberRoleRequest(MembershipRole.GROUP_ADMIN);

        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminMember));
        TripMembership adminMembership = new TripMembership(20, trip, adminMember, MembershipRole.GROUP_ADMIN, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 2)).thenReturn(Optional.of(adminMembership));

        TripMembership regMembership = new TripMembership(30, trip, regularMember, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 3)).thenReturn(Optional.of(regMembership));
        when(tripMembershipRepository.save(any(TripMembership.class))).thenReturn(regMembership);

        TripMemberResponse response = tripMembershipService.changeMemberRole(10, 3, request, "admin@example.com");

        assertNotNull(response);
        assertEquals(MembershipRole.GROUP_ADMIN, response.getRole());
    }

    // 10. Regular member attempts role change -> 403
    @Test
    void testRegularMemberChangesRole_ThrowsForbidden() {
        ChangeMemberRoleRequest request = new ChangeMemberRoleRequest(MembershipRole.GROUP_ADMIN);

        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("regular@example.com")).thenReturn(Optional.of(regularMember));
        TripMembership regMembership = new TripMembership(30, trip, regularMember, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 3)).thenReturn(Optional.of(regMembership));

        assertThrows(UnauthorizedTripMembershipOperationException.class,
                () -> tripMembershipService.changeMemberRole(10, 2, request, "regular@example.com"));
    }

    // 11. Add same user twice -> 409 Conflict
    @Test
    void testAddDuplicateMember_ThrowsAlreadyMember() {
        AddTripMemberRequest request = new AddTripMemberRequest("regular@example.com", MembershipRole.MEMBER);

        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(userRepository.findByEmail("regular@example.com")).thenReturn(Optional.of(regularMember));
        when(tripMembershipRepository.existsByTripIdAndUserId(10, 3)).thenReturn(true);

        assertThrows(AlreadyTripMemberException.class,
                () -> tripMembershipService.addMember(10, request, "owner@example.com"));
    }

    // 12. Unknown email -> 404
    @Test
    void testAddMemberUnknownEmail_ThrowsNotFound() {
        AddTripMemberRequest request = new AddTripMemberRequest("unknown@example.com", MembershipRole.MEMBER);

        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> tripMembershipService.addMember(10, request, "owner@example.com"));
    }

    // 13. Unknown trip -> 404
    @Test
    void testAddMemberUnknownTrip_ThrowsNotFound() {
        AddTripMemberRequest request = new AddTripMemberRequest("target@example.com", MembershipRole.MEMBER);

        when(tripRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> tripMembershipService.addMember(999, request, "owner@example.com"));
    }

    // 14. Demote owner or last group admin -> IllegalArgumentException (400)
    @Test
    void testDemoteOwner_ThrowsIllegalArgument() {
        ChangeMemberRoleRequest request = new ChangeMemberRoleRequest(MembershipRole.MEMBER);

        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));

        TripMembership ownerMembership = new TripMembership(10, trip, owner, MembershipRole.GROUP_ADMIN, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 1)).thenReturn(Optional.of(ownerMembership));

        assertThrows(IllegalArgumentException.class,
                () -> tripMembershipService.changeMemberRole(10, 1, request, "owner@example.com"));
    }

    @Test
    void testRemoveLastGroupAdmin_ThrowsIllegalArgument() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));

        TripMembership adminMembership = new TripMembership(20, trip, adminMember, MembershipRole.GROUP_ADMIN, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 2)).thenReturn(Optional.of(adminMembership));
        when(tripMembershipRepository.countByTripIdAndRole(10, MembershipRole.GROUP_ADMIN)).thenReturn(1L);

        assertThrows(IllegalArgumentException.class,
                () -> tripMembershipService.removeMember(10, 2, "owner@example.com"));
    }
}
