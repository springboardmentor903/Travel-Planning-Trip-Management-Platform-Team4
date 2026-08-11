package com.tripnest.tripnest_backend.config;
 
import com.tripnest.tripnest_backend.entity.Role;
import com.tripnest.tripnest_backend.entity.User;
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
 
        // Guard: if the seeded admin already exists, stop here.
        // This is the ONLY place in the entire codebase that creates an
        // ADMINISTRATOR account directly — and it only ever runs once.
        if (userRepository.existsByEmail(DEFAULT_ADMIN_EMAIL)) {
            return;
        }
 
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
}
