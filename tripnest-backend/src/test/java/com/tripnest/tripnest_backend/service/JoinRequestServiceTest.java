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
class JoinRequestServiceTest {

    @Mock
    private JoinRequestRepository joinRequestRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TripMembershipRepository tripMembershipRepository;

    @Mock
    private TripAccessService tripAccessService;

    @InjectMocks
    private JoinRequestService joinRequestService;

    private User owner;
    private User requester;
    private User admin;
    private Trip trip;
    private JoinRequest pendingRequest;

    @BeforeEach
    void setUp() {
        Role role = new Role(1, "TRAVELER");
        owner = new User(1, "Owner", "owner@example.com", "hash", role, false, LocalDateTime.now());
        requester = new User(2, "Requester", "requester@example.com", "hash", role, false, LocalDateTime.now());
        admin = new User(3, "Admin", "admin@example.com", "hash", role, false, LocalDateTime.now());

        Destination destination = new Destination(1, "Goa", "India", "Goa", "Desc", "url", "Beach");
        trip = new Trip(10, "Goa Friends Trip", owner, destination, LocalDate.now().plusDays(1), LocalDate.now().plusDays(5), 1000.0, "Notes", LocalDateTime.now());

        pendingRequest = new JoinRequest(100, trip, requester, JoinRequestStatus.PENDING, LocalDateTime.now(), null, null);
    }

    // 1. Search trip by name
    @Test
    void testSearchTripsByName_ExactMatch() {
        when(tripRepository.findByTitleContainingIgnoreCase("Goa")).thenReturn(List.of(trip));
        List<TripSearchResponse> results = joinRequestService.searchTripsByName("Goa");
        assertEquals(1, results.size());
        assertEquals("Goa Friends Trip", results.get(0).getTitle());
    }

    // 2. Search case-insensitively
    @Test
    void testSearchTripsByName_CaseInsensitive() {
        when(tripRepository.findByTitleContainingIgnoreCase("goa")).thenReturn(List.of(trip));
        List<TripSearchResponse> results = joinRequestService.searchTripsByName("goa");
        assertEquals(1, results.size());
        assertEquals("Goa Friends Trip", results.get(0).getTitle());
    }

    // 3. Search partial trip name
    @Test
    void testSearchTripsByName_PartialName() {
        when(tripRepository.findByTitleContainingIgnoreCase("Friends")).thenReturn(List.of(trip));
        List<TripSearchResponse> results = joinRequestService.searchTripsByName("Friends");
        assertEquals(1, results.size());
        assertEquals("Goa Friends Trip", results.get(0).getTitle());
    }

    // 4. User submits join request
    @Test
    void testCreateJoinRequest_Success() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("requester@example.com")).thenReturn(Optional.of(requester));
        when(tripMembershipRepository.existsByTripIdAndUserId(10, 2)).thenReturn(false);
        when(joinRequestRepository.existsByTripIdAndRequesterIdAndStatus(10, 2, JoinRequestStatus.PENDING)).thenReturn(false);
        when(joinRequestRepository.save(any(JoinRequest.class))).thenReturn(pendingRequest);

        JoinRequestResponse response = joinRequestService.createJoinRequest(10, "requester@example.com");

        assertNotNull(response);
        assertEquals(100, response.getRequestId());
        assertEquals(JoinRequestStatus.PENDING, response.getStatus());
    }

    // 5. User already member -> cannot request
    @Test
    void testCreateJoinRequest_UserAlreadyMember_ThrowsException() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("requester@example.com")).thenReturn(Optional.of(requester));
        when(tripMembershipRepository.existsByTripIdAndUserId(10, 2)).thenReturn(true);

        assertThrows(AlreadyTripMemberException.class,
                () -> joinRequestService.createJoinRequest(10, "requester@example.com"));
    }

    // 6. Trip owner requests own trip -> cannot request
    @Test
    void testCreateJoinRequest_TripOwner_ThrowsException() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));

        assertThrows(IllegalArgumentException.class,
                () -> joinRequestService.createJoinRequest(10, "owner@example.com"));
    }

    // 7. Duplicate pending request -> cannot create
    @Test
    void testCreateJoinRequest_DuplicatePending_ThrowsException() {
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("requester@example.com")).thenReturn(Optional.of(requester));
        when(tripMembershipRepository.existsByTripIdAndUserId(10, 2)).thenReturn(false);
        when(joinRequestRepository.existsByTripIdAndRequesterIdAndStatus(10, 2, JoinRequestStatus.PENDING)).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> joinRequestService.createJoinRequest(10, "requester@example.com"));
    }

    // 8. Admin views pending requests
    @Test
    void testGetPendingJoinRequests_Success() {
        doNothing().when(tripAccessService).validateTripManagement(10, "owner@example.com");
        when(joinRequestRepository.findByTripIdAndStatus(10, JoinRequestStatus.PENDING)).thenReturn(List.of(pendingRequest));

        List<JoinRequestResponse> requests = joinRequestService.getPendingJoinRequests(10, "owner@example.com");

        assertEquals(1, requests.size());
        assertEquals(100, requests.get(0).getRequestId());
    }

    // 9. MEMBER attempts to view admin requests -> 403
    @Test
    void testGetPendingJoinRequests_Member_Throws403() {
        doThrow(new UnauthorizedTripMembershipOperationException("Access denied"))
                .when(tripAccessService).validateTripManagement(10, "requester@example.com");

        assertThrows(UnauthorizedTripMembershipOperationException.class,
                () -> joinRequestService.getPendingJoinRequests(10, "requester@example.com"));
    }

    // 10 & 11. Admin approves request -> creates MEMBER membership
    @Test
    void testApproveJoinRequest_Success() {
        doNothing().when(tripAccessService).validateTripManagement(10, "owner@example.com");
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(joinRequestRepository.findByIdAndTripId(100, 10)).thenReturn(Optional.of(pendingRequest));
        when(tripMembershipRepository.existsByTripIdAndUserId(10, 2)).thenReturn(false);
        when(joinRequestRepository.save(any(JoinRequest.class))).thenReturn(pendingRequest);

        JoinRequestResponse response = joinRequestService.approveJoinRequest(10, 100, "owner@example.com");

        assertNotNull(response);
        verify(tripMembershipRepository, times(1)).save(any(TripMembership.class));
        assertEquals(JoinRequestStatus.APPROVED, pendingRequest.getStatus());
    }

    // 12 & 13. Admin rejects request -> does not create membership
    @Test
    void testRejectJoinRequest_Success() {
        doNothing().when(tripAccessService).validateTripManagement(10, "owner@example.com");
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(joinRequestRepository.findByIdAndTripId(100, 10)).thenReturn(Optional.of(pendingRequest));
        when(joinRequestRepository.save(any(JoinRequest.class))).thenReturn(pendingRequest);

        JoinRequestResponse response = joinRequestService.rejectJoinRequest(10, 100, "owner@example.com");

        assertNotNull(response);
        verify(tripMembershipRepository, never()).save(any());
        assertEquals(JoinRequestStatus.REJECTED, pendingRequest.getStatus());
    }

    // 14. Requester cancels pending request
    @Test
    void testCancelJoinRequest_Success() {
        when(userRepository.findByEmail("requester@example.com")).thenReturn(Optional.of(requester));
        when(joinRequestRepository.findByIdAndTripId(100, 10)).thenReturn(Optional.of(pendingRequest));

        assertDoesNotThrow(() -> joinRequestService.cancelJoinRequest(10, 100, "requester@example.com"));
        assertEquals(JoinRequestStatus.CANCELLED, pendingRequest.getStatus());
    }

    // 15. User cannot modify another user's request
    @Test
    void testCancelJoinRequest_OtherUser_ThrowsException() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        when(joinRequestRepository.findByIdAndTripId(100, 10)).thenReturn(Optional.of(pendingRequest));

        assertThrows(UnauthorizedTripMembershipOperationException.class,
                () -> joinRequestService.cancelJoinRequest(10, 100, "admin@example.com"));
    }

    // 16. Non-member cannot approve/reject
    @Test
    void testApproveJoinRequest_NonMember_Throws403() {
        doThrow(new UnauthorizedTripMembershipOperationException("Access denied"))
                .when(tripAccessService).validateTripManagement(10, "nonmember@example.com");

        assertThrows(UnauthorizedTripMembershipOperationException.class,
                () -> joinRequestService.approveJoinRequest(10, 100, "nonmember@example.com"));
    }

    // 17. Invalid request ID -> 404
    @Test
    void testApproveJoinRequest_InvalidRequestId_Throws404() {
        doNothing().when(tripAccessService).validateTripManagement(10, "owner@example.com");
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(joinRequestRepository.findByIdAndTripId(999, 10)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> joinRequestService.approveJoinRequest(10, 999, "owner@example.com"));
    }

    // 18. Request belonging to another trip -> 404
    @Test
    void testApproveJoinRequest_RequestAnotherTrip_Throws404() {
        doNothing().when(tripAccessService).validateTripManagement(99, "owner@example.com");
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(joinRequestRepository.findByIdAndTripId(100, 99)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> joinRequestService.approveJoinRequest(99, 100, "owner@example.com"));
    }

    // 19. Already-approved request cannot be approved again
    @Test
    void testApproveJoinRequest_AlreadyApproved_ThrowsException() {
        doNothing().when(tripAccessService).validateTripManagement(10, "owner@example.com");
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        pendingRequest.setStatus(JoinRequestStatus.APPROVED);
        when(joinRequestRepository.findByIdAndTripId(100, 10)).thenReturn(Optional.of(pendingRequest));

        assertThrows(IllegalArgumentException.class,
                () -> joinRequestService.approveJoinRequest(10, 100, "owner@example.com"));
    }

    // 20. Already-rejected request cannot be approved
    @Test
    void testApproveJoinRequest_AlreadyRejected_ThrowsException() {
        doNothing().when(tripAccessService).validateTripManagement(10, "owner@example.com");
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        pendingRequest.setStatus(JoinRequestStatus.REJECTED);
        when(joinRequestRepository.findByIdAndTripId(100, 10)).thenReturn(Optional.of(pendingRequest));

        assertThrows(IllegalArgumentException.class,
                () -> joinRequestService.approveJoinRequest(10, 100, "owner@example.com"));
    }
}
