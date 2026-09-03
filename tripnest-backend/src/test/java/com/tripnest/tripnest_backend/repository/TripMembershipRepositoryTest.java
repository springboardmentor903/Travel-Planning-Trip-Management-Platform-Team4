package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TripMembershipRepositoryTest {

    @Autowired
    private TripMembershipRepository tripMembershipRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    private User savedUser1;
    private User savedUser2;
    private Trip savedTrip;

    @BeforeEach
    void setUp() {
        Role role = roleRepository.findByName("TRAVELER")
                .orElseGet(() -> roleRepository.save(new Role(null, "TRAVELER")));

        User user1 = new User();
        user1.setName("Alice Traveler");
        user1.setEmail("alice.test@example.com");
        user1.setPasswordHash("hashed_secret");
        user1.setRole(role);
        user1.setOauthGoogle(false);
        savedUser1 = userRepository.save(user1);

        User user2 = new User();
        user2.setName("Bob Traveler");
        user2.setEmail("bob.test@example.com");
        user2.setPasswordHash("hashed_secret");
        user2.setRole(role);
        user2.setOauthGoogle(false);
        savedUser2 = userRepository.save(user2);

        Destination destination = new Destination(null, "Kyoto", "Japan", "Kyoto", "Historical temples", "http://example.com/kyoto.jpg", "Historical");
        Destination savedDestination = destinationRepository.save(destination);

        Trip trip = new Trip();
        trip.setTitle("Kyoto Trip");
        trip.setUser(savedUser1);
        trip.setDestination(savedDestination);
        trip.setStartDate(LocalDate.now().plusDays(10));
        trip.setEndDate(LocalDate.now().plusDays(15));

        savedTrip = tripRepository.save(trip);
    }

    @Test
    void testSaveAndFindByTripIdAndUserId() {
        TripMembership membership = new TripMembership();
        membership.setTrip(savedTrip);
        membership.setUser(savedUser1);
        membership.setRole(MembershipRole.GROUP_ADMIN);

        TripMembership saved = tripMembershipRepository.save(membership);
        assertNotNull(saved.getId());
        assertNotNull(saved.getCreatedAt());

        Optional<TripMembership> found = tripMembershipRepository.findByTripIdAndUserId(savedTrip.getId(), savedUser1.getId());
        assertTrue(found.isPresent());
        assertEquals(MembershipRole.GROUP_ADMIN, found.get().getRole());
    }

    @Test
    void testFindByTripIdAndFindByUserId() {
        TripMembership m1 = new TripMembership(null, savedTrip, savedUser1, MembershipRole.GROUP_ADMIN, null);
        TripMembership m2 = new TripMembership(null, savedTrip, savedUser2, MembershipRole.MEMBER, null);

        tripMembershipRepository.saveAll(List.of(m1, m2));

        List<TripMembership> tripMemberships = tripMembershipRepository.findByTripId(savedTrip.getId());
        assertEquals(2, tripMemberships.size());

        List<TripMembership> user2Memberships = tripMembershipRepository.findByUserId(savedUser2.getId());
        assertEquals(1, user2Memberships.size());
        assertEquals(MembershipRole.MEMBER, user2Memberships.get(0).getRole());
    }

    @Test
    void testFindByTripIdAndUserEmail() {
        TripMembership m1 = new TripMembership(null, savedTrip, savedUser1, MembershipRole.GROUP_ADMIN, null);
        tripMembershipRepository.save(m1);

        Optional<TripMembership> found = tripMembershipRepository.findByTripIdAndUserEmail(savedTrip.getId(), "alice.test@example.com");
        assertTrue(found.isPresent());
        assertEquals(savedUser1.getId(), found.get().getUser().getId());

        boolean exists = tripMembershipRepository.existsByTripIdAndUserEmail(savedTrip.getId(), "alice.test@example.com");
        assertTrue(exists);
    }

    @Test
    void testFindByTripIdAndRoleAndCountByRole() {
        TripMembership m1 = new TripMembership(null, savedTrip, savedUser1, MembershipRole.GROUP_ADMIN, null);
        TripMembership m2 = new TripMembership(null, savedTrip, savedUser2, MembershipRole.MEMBER, null);

        tripMembershipRepository.saveAll(List.of(m1, m2));

        List<TripMembership> admins = tripMembershipRepository.findByTripIdAndRole(savedTrip.getId(), MembershipRole.GROUP_ADMIN);
        assertEquals(1, admins.size());
        assertEquals(savedUser1.getId(), admins.get(0).getUser().getId());

        long adminCount = tripMembershipRepository.countByTripIdAndRole(savedTrip.getId(), MembershipRole.GROUP_ADMIN);
        assertEquals(1L, adminCount);
    }

    @Test
    void testDeleteByTripIdAndUserId() {
        TripMembership m1 = new TripMembership(null, savedTrip, savedUser1, MembershipRole.GROUP_ADMIN, null);
        tripMembershipRepository.save(m1);

        assertTrue(tripMembershipRepository.existsByTripIdAndUserId(savedTrip.getId(), savedUser1.getId()));

        tripMembershipRepository.deleteByTripIdAndUserId(savedTrip.getId(), savedUser1.getId());
        tripMembershipRepository.flush();

        assertFalse(tripMembershipRepository.existsByTripIdAndUserId(savedTrip.getId(), savedUser1.getId()));
    }

    @Test
    void testUniqueConstraintOnTripAndUser() {
        TripMembership m1 = new TripMembership(null, savedTrip, savedUser1, MembershipRole.GROUP_ADMIN, null);
        tripMembershipRepository.saveAndFlush(m1);

        TripMembership duplicate = new TripMembership(null, savedTrip, savedUser1, MembershipRole.MEMBER, null);
        assertThrows(DataIntegrityViolationException.class, () -> {
            tripMembershipRepository.saveAndFlush(duplicate);
        });
    }
}
