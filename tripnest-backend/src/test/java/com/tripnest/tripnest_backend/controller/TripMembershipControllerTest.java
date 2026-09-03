package com.tripnest.tripnest_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripnest.tripnest_backend.dto.AddTripMemberRequest;
import com.tripnest.tripnest_backend.dto.ChangeMemberRoleRequest;
import com.tripnest.tripnest_backend.dto.TripMemberResponse;
import com.tripnest.tripnest_backend.entity.MembershipRole;
import com.tripnest.tripnest_backend.exception.AlreadyTripMemberException;
import com.tripnest.tripnest_backend.exception.GlobalExceptionHandler;
import com.tripnest.tripnest_backend.exception.UnauthorizedTripMembershipOperationException;
import com.tripnest.tripnest_backend.service.TripMembershipService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TripMembershipControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private TripMembershipService tripMembershipService;

    @InjectMocks
    private TripMembershipController tripMembershipController;

    private Authentication ownerAuth;
    private Authentication regularAuth;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(tripMembershipController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();

        ownerAuth = new UsernamePasswordAuthenticationToken("owner@example.com", "password");
        regularAuth = new UsernamePasswordAuthenticationToken("regular@example.com", "password");
    }

    @Test
    void testAddMember_Success() throws Exception {
        AddTripMemberRequest request = new AddTripMemberRequest("target@example.com", MembershipRole.MEMBER);
        TripMemberResponse response = new TripMemberResponse(1, 10, 4, "Target", "target@example.com", MembershipRole.MEMBER, LocalDateTime.now());

        when(tripMembershipService.addMember(eq(10), any(AddTripMemberRequest.class), eq("owner@example.com")))
                .thenReturn(response);

        mockMvc.perform(post("/api/trips/10/members")
                        .principal(ownerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.membershipId").value(1))
                .andExpect(jsonPath("$.email").value("target@example.com"))
                .andExpect(jsonPath("$.role").value("MEMBER"));
    }

    @Test
    void testAddMember_Forbidden() throws Exception {
        AddTripMemberRequest request = new AddTripMemberRequest("target@example.com", MembershipRole.MEMBER);

        when(tripMembershipService.addMember(eq(10), any(AddTripMemberRequest.class), eq("regular@example.com")))
                .thenThrow(new UnauthorizedTripMembershipOperationException("Only trip owners or group admins can add members"));

        mockMvc.perform(post("/api/trips/10/members")
                        .principal(regularAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Only trip owners or group admins can add members"));
    }

    @Test
    void testAddMember_AlreadyMember_Conflict() throws Exception {
        AddTripMemberRequest request = new AddTripMemberRequest("target@example.com", MembershipRole.MEMBER);

        when(tripMembershipService.addMember(eq(10), any(AddTripMemberRequest.class), eq("owner@example.com")))
                .thenThrow(new AlreadyTripMemberException("User is already a member"));

        mockMvc.perform(post("/api/trips/10/members")
                        .principal(ownerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("User is already a member"));
    }

    @Test
    void testGetMembers_Success() throws Exception {
        TripMemberResponse r1 = new TripMemberResponse(1, 10, 1, "Owner", "owner@example.com", MembershipRole.GROUP_ADMIN, LocalDateTime.now());
        TripMemberResponse r2 = new TripMemberResponse(2, 10, 2, "Member", "member@example.com", MembershipRole.MEMBER, LocalDateTime.now());

        when(tripMembershipService.getTripMembers(10, "owner@example.com")).thenReturn(List.of(r1, r2));

        mockMvc.perform(get("/api/trips/10/members").principal(ownerAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].email").value("owner@example.com"));
    }

    @Test
    void testRemoveMember_Success() throws Exception {
        doNothing().when(tripMembershipService).removeMember(10, 2, "owner@example.com");

        mockMvc.perform(delete("/api/trips/10/members/2").principal(ownerAuth))
                .andExpect(status().isNoContent());
    }

    @Test
    void testChangeMemberRole_Success() throws Exception {
        ChangeMemberRoleRequest request = new ChangeMemberRoleRequest(MembershipRole.GROUP_ADMIN);
        TripMemberResponse response = new TripMemberResponse(2, 10, 2, "Member", "member@example.com", MembershipRole.GROUP_ADMIN, LocalDateTime.now());

        when(tripMembershipService.changeMemberRole(eq(10), eq(2), any(ChangeMemberRoleRequest.class), eq("owner@example.com")))
                .thenReturn(response);

        mockMvc.perform(patch("/api/trips/10/members/2/role")
                        .principal(ownerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("GROUP_ADMIN"));
    }
}
