package com.tripnest.tripnest_backend.config;

import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.entity.Role;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import com.tripnest.tripnest_backend.repository.RoleRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final PasswordEncoder passwordEncoder;

    private static final List<String> DEFAULT_ROLES = List.of("TRAVELER", "GROUP_ADMIN", "ADMINISTRATOR");
    private static final String DEFAULT_ADMIN_EMAIL = "admin@tripnest.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "Admin@123";

    @Override
    public void run(String... args) {
        DEFAULT_ROLES.forEach(roleName -> {
            if (roleRepository.findByName(roleName).isEmpty()) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.save(role);
            }
        });

        if (!userRepository.existsByEmail(DEFAULT_ADMIN_EMAIL)) {
            Role adminRole = roleRepository.findByName("ADMINISTRATOR")
                    .orElseThrow(() -> new RuntimeException("ADMINISTRATOR role missing after seeding"));

            User admin = new User();
            admin.setName("Default Administrator");
            admin.setEmail(DEFAULT_ADMIN_EMAIL);
            admin.setPasswordHash(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD));
            admin.setRole(adminRole);
            admin.setOauthGoogle(false);
            userRepository.save(admin);
        }

        if (destinationRepository.count() == 0) {
            Destination d1 = new Destination(null, "Paris", "France", "Paris", "The City of Light, famous for the Eiffel Tower, Louvre Museum, and rich culture.", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34", "Metropolitan");
            Destination d2 = new Destination(null, "Tokyo", "Japan", "Tokyo", "A bustling metropolis blending ultra-modern skyscrapers with historic temples.", "https://images.unsplash.com/photo-1503899036084-c55cdd92da26", "Metropolitan");
            Destination d3 = new Destination(null, "Bali", "Indonesia", "Denpasar", "Tropical paradise known for its volcanic mountains, iconic rice paddies, and beaches.", "https://images.unsplash.com/photo-1537996194471-e657df975ab4", "Beach");

            destinationRepository.saveAll(List.of(d1, d2, d3));
        }
    }
}
