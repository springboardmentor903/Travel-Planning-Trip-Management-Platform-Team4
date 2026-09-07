package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.entity.Role;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.RoleRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import com.tripnest.tripnest_backend.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DashboardSecurityIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private String travelerToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        Role travelerRole = roleRepository.findByName("TRAVELER").orElseGet(() -> {
            Role r = new Role();
            r.setName("TRAVELER");
            return roleRepository.save(r);
        });

        Role adminRole = roleRepository.findByName("ADMINISTRATOR").orElseGet(() -> {
            Role r = new Role();
            r.setName("ADMINISTRATOR");
            return roleRepository.save(r);
        });

        User traveler = userRepository.findByEmail("traveler.sec@example.com").orElseGet(() -> {
            User u = new User();
            u.setName("Sec Traveler");
            u.setEmail("traveler.sec@example.com");
            u.setPasswordHash(passwordEncoder.encode("Password@123"));
            u.setRole(travelerRole);
            return userRepository.save(u);
        });

        User admin = userRepository.findByEmail("admin.sec@tripnest.com").orElseGet(() -> {
            User u = new User();
            u.setName("Sec Admin");
            u.setEmail("admin.sec@tripnest.com");
            u.setPasswordHash(passwordEncoder.encode("Password@123"));
            u.setRole(adminRole);
            return userRepository.save(u);
        });

        travelerToken = jwtUtil.generateToken(traveler.getEmail());
        adminToken = jwtUtil.generateToken(admin.getEmail());
    }

    @Test
    void testTravelerDashboard_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/api/dashboard/traveler"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testTravelerDashboard_AuthenticatedTraveler_Returns200() throws Exception {
        mockMvc.perform(get("/api/dashboard/traveler")
                        .header("Authorization", "Bearer " + travelerToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.upcomingTrips").isArray())
                .andExpect(jsonPath("$.budgetOverview").isMap())
                .andExpect(jsonPath("$.expenseSummary").isArray())
                .andExpect(jsonPath("$.destinations").isArray())
                .andExpect(jsonPath("$.travelStats").isMap());
    }

    @Test
    void testAdminDashboard_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/api/dashboard/admin"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testAdminDashboard_NonAdminTraveler_Returns403() throws Exception {
        mockMvc.perform(get("/api/dashboard/admin")
                        .header("Authorization", "Bearer " + travelerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminDashboard_Administrator_Returns200() throws Exception {
        mockMvc.perform(get("/api/dashboard/admin")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userAnalytics.totalUsers").isNumber())
                .andExpect(jsonPath("$.tripAnalytics.totalTrips").isNumber())
                .andExpect(jsonPath("$.destinationAnalytics").isArray())
                .andExpect(jsonPath("$.platformStats.totalExpenses").isNumber());
    }

    @Test
    void testAdminControllerDashboard_NonAdminTraveler_Returns403() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + travelerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminControllerDashboard_Administrator_Returns200() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userAnalytics.totalUsers").isNumber())
                .andExpect(jsonPath("$.tripAnalytics.totalTrips").isNumber());
    }
}