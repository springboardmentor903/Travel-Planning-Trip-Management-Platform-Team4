package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.entity.*;
import com.tripnest.tripnest_backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AdminAnalyticsIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    private User adminUser;
    private User regularUser;
    private Destination paris;
    private Destination tokyo;
    private Destination bali;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        Role adminRole = roleRepository.findByName("ADMINISTRATOR")
                .orElseGet(() -> roleRepository.save(new Role(null, "ADMINISTRATOR")));
        Role travelerRole = roleRepository.findByName("TRAVELER")
                .orElseGet(() -> roleRepository.save(new Role(null, "TRAVELER")));
        roleRepository.findByName("GROUP_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role(null, "GROUP_ADMIN")));

        adminUser = new User();
        adminUser.setName("Admin Tester");
        adminUser.setEmail("admintest@tripnest.com");
        adminUser.setPasswordHash("hash123");
        adminUser.setRole(adminRole);
        adminUser.setOauthGoogle(false);
        userRepository.save(adminUser);

        regularUser = new User();
        regularUser.setName("Traveler Tester");
        regularUser.setEmail("traveler@tripnest.com");
        regularUser.setPasswordHash("hash123");
        regularUser.setRole(travelerRole);
        regularUser.setOauthGoogle(false);
        userRepository.save(regularUser);

        paris = destinationRepository.save(new Destination(null, "Paris", "France", "Paris", "City of Light", "http://example.com/paris.jpg", "Metropolitan"));
        tokyo = destinationRepository.save(new Destination(null, "Tokyo", "Japan", "Tokyo", "Metropolis", "http://example.com/tokyo.jpg", "Metropolitan"));
        bali = destinationRepository.save(new Destination(null, "Bali", "Indonesia", "Denpasar", "Island", "http://example.com/bali.jpg", "Beach"));
    }

    @Test
    @DisplayName("Test 1: Unauthenticated request to /api/admin/analytics should be denied")
    void testUnauthenticatedAccessDenied() throws Exception {
        mockMvc.perform(get("/api/admin/analytics-summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "traveler@tripnest.com", roles = "TRAVELER")
    @DisplayName("Test 2: TRAVELER role access to /api/admin/analytics should return 403 Forbidden")
    void testTravelerAccessForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/analytics-summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "groupadmin@tripnest.com", roles = "GROUP_ADMIN")
    @DisplayName("Test 3: GROUP_ADMIN role access to /api/admin/analytics should return 403 Forbidden")
    void testGroupAdminAccessForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/analytics-summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@tripnest.com", roles = "ADMINISTRATOR")
    @DisplayName("Test 4: ADMINISTRATOR role access to /api/admin/analytics should return 200 OK with analytics")
    void testAdminAccessSuccess() throws Exception {
        mockMvc.perform(get("/api/admin/analytics-summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").isNumber())
                .andExpect(jsonPath("$.tripAnalytics").exists())
                .andExpect(jsonPath("$.tripAnalytics.totalTrips").isNumber())
                .andExpect(jsonPath("$.tripAnalytics.activeTrips").isNumber())
                .andExpect(jsonPath("$.tripAnalytics.completedTrips").isNumber())
                .andExpect(jsonPath("$.popularDestinations").isArray())
                .andExpect(jsonPath("$.platformStats").exists())
                .andExpect(jsonPath("$.platformStats.totalExpenses").isNumber())
                .andExpect(jsonPath("$.platformStats.totalNotifications").isNumber());
    }

    @Test
    @WithMockUser(username = "admin@tripnest.com", roles = "ADMINISTRATOR")
    @DisplayName("Test 5 to 8: Calculation correctness for trips, statuses, popular destinations order, expenses, notifications")
    void testAnalyticsCalculations() throws Exception {
        // Create trips: 2 in Bali (1 ACTIVE, 1 COMPLETED), 1 in Paris (PLANNED)
        Trip t1 = new Trip();
        t1.setTitle("Bali Summer");
        t1.setUser(regularUser);
        t1.setDestination(bali);
        t1.setStartDate(LocalDate.now().minusDays(2));
        t1.setEndDate(LocalDate.now().plusDays(5));
        t1.setStatus(TripStatus.ACTIVE);
        t1.setBudget(25000.0);
        tripRepository.save(t1);

        Trip t2 = new Trip();
        t2.setTitle("Bali Honeymoon");
        t2.setUser(regularUser);
        t2.setDestination(bali);
        t2.setStartDate(LocalDate.now().minusDays(10));
        t2.setEndDate(LocalDate.now().minusDays(2));
        t2.setStatus(TripStatus.COMPLETED);
        t2.setBudget(50000.0);
        tripRepository.save(t2);

        Trip t3 = new Trip();
        t3.setTitle("Paris Autumn");
        t3.setUser(regularUser);
        t3.setDestination(paris);
        t3.setStartDate(LocalDate.now().plusDays(20));
        t3.setEndDate(LocalDate.now().plusDays(30));
        t3.setStatus(TripStatus.PLANNED);
        t3.setBudget(80000.0);
        tripRepository.save(t3);

        // Create Expenses: 1500.50 and 2499.50 -> Total = 4000.00
        Expense e1 = new Expense();
        e1.setTrip(t1);
        e1.setPayer(regularUser);
        e1.setCategory(ExpenseCategory.FOOD);
        e1.setAmount(new BigDecimal("1500.50"));
        e1.setDate(LocalDate.now());
        expenseRepository.save(e1);

        Expense e2 = new Expense();
        e2.setTrip(t2);
        e2.setPayer(regularUser);
        e2.setCategory(ExpenseCategory.TRANSPORTATION);
        e2.setAmount(new BigDecimal("2499.50"));
        e2.setDate(LocalDate.now());
        expenseRepository.save(e2);

        // Create Notifications: 2 records
        Notification n1 = new Notification(null, regularUser, "Notification 1", "EVENT_1", null);
        Notification n2 = new Notification(null, adminUser, "Notification 2", "EVENT_2", null);
        notificationRepository.save(n1);
        notificationRepository.save(n2);

        mockMvc.perform(get("/api/admin/analytics-summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                // Trip Analytics: 3 trips (1 active, 1 completed, 1 planned)
                .andExpect(jsonPath("$.tripAnalytics.totalTrips").value(3))
                .andExpect(jsonPath("$.tripAnalytics.ongoingTrips").value(1))
                .andExpect(jsonPath("$.tripAnalytics.completedTrips").value(1))
                // Popular Destinations: Bali has 2 trips, Paris has 1 trip, Tokyo has 0 trips
                .andExpect(jsonPath("$.popularDestinations[0].destinationName").value("Bali"))
                .andExpect(jsonPath("$.popularDestinations[0].tripCount").value(2))
                .andExpect(jsonPath("$.popularDestinations[1].destinationName").value("Paris"))
                .andExpect(jsonPath("$.popularDestinations[1].tripCount").value(1))
                // Platform Stats: total expenses = 4000.00, total notifications = 2
                .andExpect(jsonPath("$.platformStats.totalExpenses").value(4000.00))
                .andExpect(jsonPath("$.platformStats.totalNotifications").value(2));
    }

    @Test
    @DisplayName("Administrator can list all trips and filter by status")
    @WithMockUser(username = "admin@test.com", roles = {"ADMINISTRATOR"})
    void testAdminListTrips() throws Exception {
        Trip t1 = new Trip();
        t1.setTitle("Admin Trip Active");
        t1.setUser(adminUser);
        t1.setDestination(bali);
        t1.setStartDate(LocalDate.now().minusDays(1));
        t1.setEndDate(LocalDate.now().plusDays(2));
        t1.setStatus(TripStatus.ACTIVE);
        tripRepository.save(t1);

        Trip t2 = new Trip();
        t2.setTitle("Admin Trip Completed");
        t2.setUser(regularUser);
        t2.setDestination(paris);
        t2.setStartDate(LocalDate.now().minusDays(10));
        t2.setEndDate(LocalDate.now().minusDays(5));
        t2.setStatus(TripStatus.COMPLETED);
        tripRepository.save(t2);

        // All trips
        mockMvc.perform(get("/api/admin/trips"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)));

        // Filter by ACTIVE
        mockMvc.perform(get("/api/admin/trips?status=ACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].title").value("Admin Trip Active"))
                .andExpect(jsonPath("$.content[0].status").value("ACTIVE"));
    }

    @Test
    @DisplayName("Administrator can list platform expenses with trip titles")
    @WithMockUser(username = "admin@test.com", roles = {"ADMINISTRATOR"})
    void testAdminListExpenses() throws Exception {
        Trip t1 = new Trip();
        t1.setTitle("Expense Trip");
        t1.setUser(adminUser);
        t1.setDestination(bali);
        t1.setStartDate(LocalDate.now());
        t1.setEndDate(LocalDate.now().plusDays(3));
        t1.setStatus(TripStatus.PLANNED);
        tripRepository.save(t1);

        Expense e1 = new Expense();
        e1.setTrip(t1);
        e1.setPayer(adminUser);
        e1.setCategory(ExpenseCategory.FOOD);
        e1.setAmount(new BigDecimal("150.00"));
        e1.setDate(LocalDate.now());
        expenseRepository.save(e1);

        mockMvc.perform(get("/api/admin/expenses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].tripTitle").value("Expense Trip"))
                .andExpect(jsonPath("$[0].amount").value(150.00));
    }

    @Test
    @DisplayName("Administrator can list platform notifications with recipient userEmail")
    @WithMockUser(username = "admin@test.com", roles = {"ADMINISTRATOR"})
    void testAdminListNotifications() throws Exception {
        Notification n = new Notification(null, regularUser, "Test Alert", "ALERT_KEY", null);
        notificationRepository.save(n);

        mockMvc.perform(get("/api/admin/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].message").value("Test Alert"))
                .andExpect(jsonPath("$[0].userEmail").value("traveler@tripnest.com"));
    }
}

