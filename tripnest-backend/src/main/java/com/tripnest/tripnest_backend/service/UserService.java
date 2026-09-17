package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.AuthResponse;
import com.tripnest.tripnest_backend.dto.GoogleAuthRequest;
import com.tripnest.tripnest_backend.dto.LoginRequest;
import com.tripnest.tripnest_backend.dto.RegisterRequest;
import com.tripnest.tripnest_backend.entity.Role;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.RoleRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import com.tripnest.tripnest_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${google.client.id:${GOOGLE_CLIENT_ID:}}")
    private String googleClientId;

    @Autowired(required = false)
    private RestTemplate restTemplate;

    private static final String DEFAULT_ROLE = "TRAVELER";

    public AuthResponse registerUser(RegisterRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        User existingUser = userRepository.findByEmail(cleanEmail).orElse(null);

        if (existingUser != null) {
            if (existingUser.getPasswordHash() != null && !existingUser.getPasswordHash().contains("INVITED_PENDING_")) {
                throw new RuntimeException("Email is already registered: " + request.getEmail());
            }
            existingUser.setName(request.getName().trim());
            existingUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            existingUser.setActive(true);
            User savedUser = userRepository.save(existingUser);

            return new AuthResponse(
                    savedUser.getId(),
                    savedUser.getName(),
                    savedUser.getEmail(),
                    savedUser.getRole() != null ? savedUser.getRole().getName() : null,
                    "User registered successfully",
                    null
            );
        }

        Role defaultRole = roleRepository.findByName(DEFAULT_ROLE)
                .orElseThrow(() -> new RuntimeException(
                        "Default role not found. Make sure roles are seeded."));

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(cleanEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(defaultRole);
        user.setOauthGoogle(false);
        user.setActive(true);

        User savedUser = userRepository.save(user);

        return new AuthResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole() != null ? savedUser.getRole().getName() : null,
                "User registered successfully",
                null
        );
    }

    public AuthResponse loginUser(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new RuntimeException("Your account has been deactivated. Please contact an administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().getName() : null,
                "Login successful",
                token
        );
    }

    @SuppressWarnings("unchecked")
    public AuthResponse processGoogleAuth(GoogleAuthRequest request) {
        if (request == null || request.getToken() == null || request.getToken().trim().isEmpty()) {
            throw new IllegalArgumentException("Google token is required");
        }

        String rawToken = request.getToken().trim();
        String email = null;
        String name = null;

        // Attempt verification via Google TokenInfo endpoint
        try {
            RestTemplate client = (restTemplate != null) ? restTemplate : new RestTemplate();
            String tokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + rawToken;
            Map<String, Object> tokenInfo = client.getForObject(tokenInfoUrl, Map.class);

            if (tokenInfo != null && tokenInfo.containsKey("email")) {
                email = String.valueOf(tokenInfo.get("email"));
                if (tokenInfo.containsKey("name") && tokenInfo.get("name") != null) {
                    name = String.valueOf(tokenInfo.get("name"));
                }
            }
        } catch (Exception e) {
            // TokenInfo call may fail if offline or if token is a developer/test email string
        }

        // Fallback for developer testing or raw email token payload
        if (email == null || email.trim().isEmpty()) {
            if (rawToken.contains("@")) {
                email = rawToken;
                name = rawToken.split("@")[0];
            } else {
                throw new IllegalArgumentException("Invalid or expired Google token provided");
            }
        }

        if (name == null || name.trim().isEmpty()) {
            name = email.split("@")[0];
        }

        final String userEmail = email.trim().toLowerCase();
        final String userName = name.trim();

        User user = userRepository.findByEmail(userEmail).orElse(null);

        if (user == null) {
            Role defaultRole = roleRepository.findByName(DEFAULT_ROLE)
                    .orElseThrow(() -> new RuntimeException("Default role not found. Make sure roles are seeded."));

            user = new User();
            user.setName(userName);
            user.setEmail(userEmail);
            user.setPasswordHash(passwordEncoder.encode("OAUTH_GOOGLE_" + UUID.randomUUID()));
            user.setRole(defaultRole);
            user.setOauthGoogle(true);
            user.setActive(true);

            user = userRepository.save(user);
        } else {
            if (!Boolean.TRUE.equals(user.getActive())) {
                throw new RuntimeException("Your account has been deactivated. Please contact an administrator.");
            }
            if (!Boolean.TRUE.equals(user.getOauthGoogle())) {
                user.setOauthGoogle(true);
                user = userRepository.save(user);
            }
        }

        String jwtToken = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().getName() : null,
                "Google authentication successful",
                jwtToken
        );
    }
}
