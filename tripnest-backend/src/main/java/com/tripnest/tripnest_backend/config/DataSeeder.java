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

        if (destinationRepository.count() < 10) {
            List<Destination> seededDestinations = List.of(
                // India
                new Destination(null, "Goa", "India", "Panaji", "Sun-kissed beaches, Portuguese architecture, vibrant nightlife, and water sports.", "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2", "Beach"),
                new Destination(null, "Kerala", "India", "Kochi", "Serene backwaters, lush tea plantations, Ayurvedic wellness, and houseboats.", "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944", "Nature"),
                new Destination(null, "Manali", "India", "Manali", "Snow-capped Himalayan peaks, adventure sports, river rafting, and scenic valleys.", "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23", "Adventure"),
                new Destination(null, "Jaipur", "India", "Jaipur", "The Pink City featuring majestic forts, royal palaces, vibrant bazaars, and heritage.", "https://images.unsplash.com/photo-1477587458883-47145ed94245", "Culture"),
                new Destination(null, "Mumbai", "India", "Mumbai", "India's financial capital, Bollywood, Gateway of India, and vibrant coastal life.", "https://images.unsplash.com/photo-1570168007204-dfb528c6958f", "City"),
                new Destination(null, "Delhi", "India", "New Delhi", "Capital city blending ancient monuments, Red Fort, Qutub Minar, and street food.", "https://images.unsplash.com/photo-1587474260584-136574528ed5", "Culture"),
                new Destination(null, "Hyderabad", "India", "Hyderabad", "City of Pearls, famous for Charminar, historic forts, and authentic Dum Biryani.", "https://images.unsplash.com/photo-1605649487212-47bdab06cf68", "Culture"),
                new Destination(null, "Bengaluru", "India", "Bengaluru", "India's Silicon Valley, lush Lalbagh botanical gardens, cool climate, and pub culture.", "https://images.unsplash.com/photo-1596176530529-78163a4f7af2", "City"),
                new Destination(null, "Ooty", "India", "Ooty", "Queen of Hill Stations with Nilgiri mountain railway, tea gardens, and misty hills.", "https://images.unsplash.com/photo-1544735716-392fe2489ffa", "Nature"),
                new Destination(null, "Pondicherry", "India", "Puducherry", "French colonial charm, tranquil beaches, Auroville, and seaside promenade.", "https://images.unsplash.com/photo-1582510003544-4d00b7f74220", "Beach"),

                // Asia
                new Destination(null, "Tokyo", "Japan", "Tokyo", "A bustling metropolis blending ultra-modern skyscrapers with historic temples.", "https://images.unsplash.com/photo-1503899036084-c55cdd92da26", "City"),
                new Destination(null, "Bali", "Indonesia", "Denpasar", "Tropical paradise known for volcanic mountains, iconic rice paddies, and beaches.", "https://images.unsplash.com/photo-1537996194471-e657df975ab4", "Beach"),
                new Destination(null, "Bangkok", "Thailand", "Bangkok", "Ornate shrines, vibrant street life, floating markets, and famous nightlife.", "https://images.unsplash.com/photo-1508009603885-50cf7c579365", "Culture"),
                new Destination(null, "Singapore", "Singapore", "Singapore", "Futuristic Gardens by the Bay, luxury shopping, Marina Bay Sands, and hawker food.", "https://images.unsplash.com/photo-1525625293386-3f8f99389edd", "Luxury"),
                new Destination(null, "Dubai", "UAE", "Dubai", "Iconic Burj Khalifa, desert safaris, luxury shopping malls, and futuristic architecture.", "https://images.unsplash.com/photo-1512453979798-5ea266f8880c", "Luxury"),

                // Europe
                new Destination(null, "Paris", "France", "Paris", "The City of Light, famous for the Eiffel Tower, Louvre Museum, and rich culture.", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34", "Culture"),
                new Destination(null, "London", "UK", "London", "Historic capital featuring Big Ben, Tower Bridge, West End theatre, and museums.", "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad", "City"),
                new Destination(null, "Rome", "Italy", "Rome", "The Eternal City with ancient Colosseum, Vatican City, and world-class Italian cuisine.", "https://images.unsplash.com/photo-1552832230-c0197dd311b5", "Culture"),
                new Destination(null, "Amsterdam", "Netherlands", "Amsterdam", "Picturesque canals, Van Gogh museum, historic townhouses, and cycling culture.", "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4", "City"),
                new Destination(null, "Switzerland", "Switzerland", "Zurich", "Alpine landscapes, glacier peaks, pristine mountain lakes, and luxury resorts.", "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99", "Nature"),

                // Americas & Other
                new Destination(null, "New York", "USA", "New York", "The Big Apple featuring Times Square, Central Park, Broadway, and Empire State Building.", "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9", "City"),
                new Destination(null, "Maldives", "Maldives", "Male", "Overwater villas, crystal clear turquoise lagoons, coral reefs, and luxury islands.", "https://images.unsplash.com/photo-1514282401047-d79a71a590e8", "Luxury"),
                new Destination(null, "Sydney", "Australia", "Sydney", "Opera House, Harbour Bridge, Bondi Beach, and vibrant coastal lifestyle.", "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9", "Beach")
            );

            for (Destination d : seededDestinations) {
                if (!destinationRepository.existsByName(d.getName())) {
                    destinationRepository.save(d);
                }
            }
        }
    }
}
