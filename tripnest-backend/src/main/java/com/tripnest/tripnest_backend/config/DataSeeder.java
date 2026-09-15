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

        // Comprehensive seed list of world destinations
        List<Destination> defaultDestinations = List.of(
            new Destination(null, "Paris", "France", "Paris", "The City of Light, famous for the Eiffel Tower, Louvre Museum, and rich culinary culture.", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34", "Metropolitan", 48.8566, 2.3522),
            new Destination(null, "Tokyo", "Japan", "Tokyo", "A bustling metropolis blending ultra-modern skyscrapers with historic temples and world-class cuisine.", "https://images.unsplash.com/photo-1503899036084-c55cdd92da26", "Metropolitan", 35.6762, 139.6503),
            new Destination(null, "Bali", "Indonesia", "Denpasar", "Tropical paradise known for its volcanic mountains, iconic rice paddies, pristine beaches, and coral reefs.", "https://images.unsplash.com/photo-1537996194471-e657df975ab4", "Beach & Nature", -8.4095, 115.1889),
            new Destination(null, "New York", "United States", "New York", "The city that never sleeps, featuring Times Square, Central Park, Broadway theaters, and iconic skyline.", "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9", "Metropolitan", 40.7128, -74.0060),
            new Destination(null, "Rome", "Italy", "Rome", "The Eternal City, home to the Colosseum, Roman Forum, Trevi Fountain, and Vatican City.", "https://images.unsplash.com/photo-1552832230-c0197dd311b5", "Historical", 41.9028, 12.4964),
            new Destination(null, "London", "United Kingdom", "London", "A royal city steeped in history, featuring Big Ben, Tower Bridge, British Museum, and vibrant West End.", "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad", "Metropolitan", 51.5074, -0.1278),
            new Destination(null, "Sydney", "Australia", "Sydney", "Breathtaking harbor city world-famous for the Sydney Opera House, Bondi Beach, and vibrant waterfront.", "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9", "Coastal", -33.8688, 151.2093),
            new Destination(null, "Dubai", "United Arab Emirates", "Dubai", "Futuristic city of luxury shopping, ultramodern architecture like the Burj Khalifa, and desert safaris.", "https://images.unsplash.com/photo-1512453979798-5ea266f8880c", "Luxury & Desert", 25.2048, 55.2708),
            new Destination(null, "Santorini", "Greece", "Thira", "Iconic Aegean island with whitewashed cliffside villages, blue-domed churches, and volcanic beaches.", "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff", "Coastal & Island", 36.3932, 25.4615),
            new Destination(null, "Cairo", "Egypt", "Cairo", "Land of Pharaohs, featuring the Great Pyramids of Giza, the Sphinx, and the ancient Egyptian Museum.", "https://images.unsplash.com/photo-1572252821143-035a4d048d08", "Historical", 30.0444, 31.2357),
            new Destination(null, "Kyoto", "Japan", "Kyoto", "Japan's cultural heartland, famed for classical Buddhist temples, gardens, shrines, and traditional tea houses.", "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e", "Cultural", 35.0116, 135.7681),
            new Destination(null, "Rio de Janeiro", "Brazil", "Rio de Janeiro", "Vibrant coastal city known for Copacabana and Ipanema beaches, Sugarloaf Mountain, and Christ the Redeemer.", "https://images.unsplash.com/photo-1483729558449-99ef09a8c325", "Coastal & Nature", -22.9068, -43.1729),
            new Destination(null, "Barcelona", "Spain", "Barcelona", "Vibrant Catalan capital famous for Antoni Gaudí's Sagrada Família, Gothic Quarter, and Mediterranean coast.", "https://images.unsplash.com/photo-1539037116277-4db20889f2d4", "Cultural & Beach", 41.3851, 2.1734),
            new Destination(null, "Cape Town", "South Africa", "Cape Town", "Breathtaking port city beneath Table Mountain, known for stunning coastlines, wineries, and wildlife reserves.", "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4", "Coastal & Nature", -33.9249, 18.4241),
            new Destination(null, "Swiss Alps", "Switzerland", "Interlaken", "Majestic alpine landscape featuring snow-capped peaks, crystal-clear lakes, hiking trails, and ski resorts.", "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99", "Mountain & Nature", 46.5588, 8.5403)
        );

        for (Destination target : defaultDestinations) {
            Destination existing = destinationRepository.findByName(target.getName()).orElse(null);
            if (existing == null) {
                destinationRepository.save(target);
            } else {
                // Ensure coordinates, category, and image URL are fully populated
                if (existing.getCategory() == null) existing.setCategory(target.getCategory());
                if (existing.getLatitude() == null) existing.setLatitude(target.getLatitude());
                if (existing.getLongitude() == null) existing.setLongitude(target.getLongitude());
                if (existing.getImageUrl() == null || existing.getImageUrl().isEmpty()) existing.setImageUrl(target.getImageUrl());
                destinationRepository.save(existing);
            }
        }
    }
}
