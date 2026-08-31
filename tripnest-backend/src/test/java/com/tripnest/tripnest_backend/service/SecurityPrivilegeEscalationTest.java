package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.AddTripMemberRequest;
import com.tripnest.tripnest_backend.dto.ChangeMemberRoleRequest;
import com.tripnest.tripnest_backend.dto.TripMemberResponse;
import com.tripnest.tripnest_backend.entity.*;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SecurityPrivilegeEscalationTest {

    @Mock
    private TripMembershipRepository tripMembershipRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TripAccessService tripAccessService;

    @InjectMocks
    private TripMembershipService tripMembershipService;

    @InjectMocks
    private TripService tripService;

    private User owner;
    private User adminMember;
    private User regularMember;
    private User targetUser;
    private Trip trip;

    @BeforeEach
    void setUp() {
        Role role = new Role(1, "TRAVELER");
        owner = new User(1, "Owner", "owner@example.com", "hash", role, false, LocalDateTime.now());
        adminMember = new User(2, "Admin Member", "admin@example.com", "hash", role, false, LocalDateTime.now());
        regularMember = new User(3, "Regular Member", "regular@example.com", "hash", role, false, LocalDateTime.now());
        targetUser = new User(4, "Target User", "target@example.com", "hash", role, false, LocalDateTime.now());

        Destination destination = new Destination(1, "Rome", "Italy", "Rome", "Desc", "url", "City");
        trip = new Trip(10, "Rome Vacation", owner, destination, LocalDate.now().plusDays(1), LocalDate.now().plusDays(5), 1000.0, "Notes", LocalDateTime.now());
    }

    // 1. MEMBER attempts to promote self -> must fail (403)
    @Test
    void testMemberPromotesSelf_FailsWith403() {
        ChangeMemberRoleRequest request = new ChangeMemberRoleRequest(MembershipRole.GROUP_ADMIN);
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("regular@example.com")).thenReturn(Optional.of(regularMember));
        TripMembership regMembership = new TripMembership(30, trip, regularMember, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 3)).thenReturn(Optional.of(regMembership));

        assertThrows(UnauthorizedTripMembershipOperationException.class,
                () -> tripMembershipService.changeMemberRole(10, 3, request, "regular@example.com"));
    }

    // 2. MEMBER attempts to promote another user -> must fail (403)
    @Test
    void testMemberPromotesAnotherUser_FailsWith403() {
        ChangeMemberRoleRequest request = new ChangeMemberRoleRequest(MembershipRole.GROUP_ADMIN);
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("regular@example.com")).thenReturn(Optional.of(regularMember));
        TripMembership regMembership = new TripMembership(30, trip, regularMember, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 3)).thenReturn(Optional.of(regMembership));

        assertThrows(UnauthorizedTripMembershipOperationException.class,
                () -> tripMembershipService.changeMemberRole(10, 4, request, "regular@example.com"));
    }

    // 3. MEMBER attempts to remove another member -> must fail (403)
    @Test
    void testMemberRemovesAnotherMember_FailsWith403() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("regular@example.com")).thenReturn(Optional.of(regularMember));
        TripMembership regMembership = new TripMembership(30, trip, regularMember, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 3)).thenReturn(Optional.of(regMembership));

        assertThrows(UnauthorizedTripMembershipOperationException.class,
                () -> tripMembershipService.removeMember(10, 4, "regular@example.com"));
    }

    // 4. MEMBER attempts to add another member -> must fail (403)
    @Test
    void testMemberAddsAnotherMember_FailsWith403() {
        AddTripMemberRequest request = new AddTripMemberRequest("target@example.com", MembershipRole.MEMBER);
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("regular@example.com")).thenReturn(Optional.of(regularMember));
        TripMembership regMembership = new TripMembership(30, trip, regularMember, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 3)).thenReturn(Optional.of(regMembership));

        assertThrows(UnauthorizedTripMembershipOperationException.class,
                () -> tripMembershipService.addMember(10, request, "regular@example.com"));
    }

    // 5. MEMBER attempts to delete trip -> must fail (403)
    @Test
    void testMemberDeletesTrip_FailsWith403() {
        doThrow(new UnauthorizedTripMembershipOperationException("Access denied: Only trip owners or group admins can manage this trip"))
                .when(tripAccessService).validateTripManagement(10, "regular@example.com");

        assertThrows(UnauthorizedTripMembershipOperationException.class,
                () -> tripService.deleteTrip(10, "regular@example.com"));
    }

    // 6. GROUP_ADMIN removes MEMBER -> allowed
    @Test
    void testGroupAdminRemovesMember_Allowed() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminMember));
        TripMembership adminShip = new TripMembership(20, trip, adminMember, MembershipRole.GROUP_ADMIN, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 2)).thenReturn(Optional.of(adminShip));

        TripMembership targetShip = new TripMembership(40, trip, targetUser, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 4)).thenReturn(Optional.of(targetShip));

        assertDoesNotThrow(() -> tripMembershipService.removeMember(10, 4, "admin@example.com"));
        verify(tripMembershipRepository, times(1)).delete(targetShip);
    }

    // 7. GROUP_ADMIN promotes MEMBER -> allowed
    @Test
    void testGroupAdminPromotesMember_Allowed() {
        ChangeMemberRoleRequest request = new ChangeMemberRoleRequest(MembershipRole.GROUP_ADMIN);
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminMember));
        TripMembership adminShip = new TripMembership(20, trip, adminMember, MembershipRole.GROUP_ADMIN, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 2)).thenReturn(Optional.of(adminShip));

        TripMembership targetShip = new TripMembership(40, trip, targetUser, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 4)).thenReturn(Optional.of(targetShip));
        when(tripMembershipRepository.save(any(TripMembership.class))).thenReturn(targetShip);

        TripMemberResponse response = tripMembershipService.changeMemberRole(10, 4, request, "admin@example.com");
        assertNotNull(response);
        assertEquals(MembershipRole.GROUP_ADMIN, response.getRole());
    }

    // 8. GROUP_ADMIN removes another GROUP_ADMIN -> allowed if multiple admins
    @Test
    void testGroupAdminRemovesAnotherGroupAdmin_AllowedIfMultipleAdmins() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminMember));
        TripMembership adminShip = new TripMembership(20, trip, adminMember, MembershipRole.GROUP_ADMIN, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 2)).thenReturn(Optional.of(adminShip));

        TripMembership anotherAdminShip = new TripMembership(40, trip, targetUser, MembershipRole.GROUP_ADMIN, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 4)).thenReturn(Optional.of(anotherAdminShip));
        when(tripMembershipRepository.countByTripIdAndRole(10, MembershipRole.GROUP_ADMIN)).thenReturn(2L);

        assertDoesNotThrow(() -> tripMembershipService.removeMember(10, 4, "admin@example.com"));
        verify(tripMembershipRepository, times(1)).delete(anotherAdminShip);
    }

    // 9. GROUP_ADMIN removes last GROUP_ADMIN -> fails (400)
    @Test
    void testGroupAdminRemovesLastGroupAdmin_FailsWith400() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminMember));
        TripMembership adminShip = new TripMembership(20, trip, adminMember, MembershipRole.GROUP_ADMIN, LocalDateTime.now());
        when(tripMembershipRepository.findByTripIdAndUserId(10, 2)).thenReturn(Optional.of(adminShip));
        when(tripMembershipRepository.countByTripIdAndRole(10, MembershipRole.GROUP_ADMIN)).thenReturn(1L);

        assertThrows(IllegalArgumentException.class,
                () -> tripMembershipService.removeMember(10, 2, "admin@example.com"));
    }

    // 10. Owner performs admin action -> allowed
    @Test
    void testOwnerPerformsAdminAction_Allowed() {
        AddTripMemberRequest request = new AddTripMemberRequest("target@example.com", MembershipRole.MEMBER);
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(userRepository.findByEmail("target@example.com")).thenReturn(Optional.of(targetUser));
        when(tripMembershipRepository.existsByTripIdAndUserId(10, 4)).thenReturn(false);

        TripMembership savedShip = new TripMembership(50, trip, targetUser, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.save(any(TripMembership.class))).thenReturn(savedShip);

        assertDoesNotThrow(() -> tripMembershipService.addMember(10, request, "owner@example.com"));
    }
}
