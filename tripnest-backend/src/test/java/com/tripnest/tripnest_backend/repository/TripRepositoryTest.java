package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.entity.Role;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TripRepositoryTest {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    private User savedUser;
    private Destination savedDestination;

    @BeforeEach
    void setUp() {
        Role role = roleRepository.findByName("TRAVELER")
                .orElseGet(() -> roleRepository.save(new Role(null, "TRAVELER")));

        User user = new User();
        user.setName("John Traveler");
        user.setEmail("john.test@example.com");
        user.setPasswordHash("hashed_secret");
        user.setRole(role);
        user.setOauthGoogle(false);
        savedUser = userRepository.save(user);

        Destination destination = new Destination(null, "Rome", "Italy", "Rome", "The Eternal City", "http://example.com/rome.jpg", "Historical");
        savedDestination = destinationRepository.save(destination);
    }

    @Test
    void testSaveAndFindTripByUserId() {
        Trip trip = new Trip();
        trip.setTitle("Summer Vacation in Rome");
        trip.setUser(savedUser);
        trip.setDestination(savedDestination);
        trip.setStartDate(LocalDate.now().plusDays(10));
        trip.setEndDate(LocalDate.now().plusDays(20));
        trip.setBudget(2500.00);
        trip.setNotes("Visit Colosseum and Vatican.");

        Trip savedTrip = tripRepository.save(trip);
        assertNotNull(savedTrip.getId());
        assertNotNull(savedTrip.getCreatedAt());

        List<Trip> userTrips = tripRepository.findByUserId(savedUser.getId());
        assertFalse(userTrips.isEmpty());
        assertEquals("Summer Vacation in Rome", userTrips.get(0).getTitle());
    }

    @Test
    void testFindByUserEmail() {
        Trip trip = new Trip();
        trip.setTitle("Business Trip to Rome");
        trip.setUser(savedUser);
        trip.setDestination(savedDestination);
        trip.setStartDate(LocalDate.now().plusDays(5));
        trip.setEndDate(LocalDate.now().plusDays(8));

        tripRepository.save(trip);

        List<Trip> trips = tripRepository.findByUserEmail("john.test@example.com");
        assertFalse(trips.isEmpty());
        assertEquals("john.test@example.com", trips.get(0).getUser().getEmail());
    }

    @Test
    void testFindByIdAndUserId() {
        Trip trip = new Trip();
        trip.setTitle("Weekend Getaway");
        trip.setUser(savedUser);
        trip.setDestination(savedDestination);
        trip.setStartDate(LocalDate.now().plusDays(2));
        trip.setEndDate(LocalDate.now().plusDays(4));

        Trip savedTrip = tripRepository.save(trip);

        Optional<Trip> foundTrip = tripRepository.findByIdAndUserId(savedTrip.getId(), savedUser.getId());
        assertTrue(foundTrip.isPresent());
        assertEquals("Weekend Getaway", foundTrip.get().getTitle());

        Optional<Trip> notFoundTrip = tripRepository.findByIdAndUserId(savedTrip.getId(), 9999);
        assertFalse(notFoundTrip.isPresent());
    }
}
