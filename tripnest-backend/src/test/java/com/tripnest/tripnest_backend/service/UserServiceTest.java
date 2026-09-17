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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserService userService;

    private Role travelerRole;

    @BeforeEach
    void setUp() {
        travelerRole = new Role(1, "TRAVELER");
    }

    @Test
    void testRegisterUser_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName("TRAVELER")).thenReturn(Optional.of(travelerRole));
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");

        User savedUser = new User();
        savedUser.setId(1);
        savedUser.setName("Test User");
        savedUser.setEmail("test@example.com");
        savedUser.setRole(travelerRole);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        AuthResponse response = userService.registerUser(request);

        assertNotNull(response);
        assertEquals("Test User", response.getName());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("TRAVELER", response.getRole());
    }

    @Test
    void testLoginUser_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        User existingUser = new User();
        existingUser.setId(1);
        existingUser.setName("Test User");
        existingUser.setEmail("test@example.com");
        existingUser.setPasswordHash("encodedPassword");
        existingUser.setRole(travelerRole);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateToken("test@example.com")).thenReturn("mockJwtToken");

        AuthResponse response = userService.loginUser(request);

        assertNotNull(response);
        assertEquals("mockJwtToken", response.getToken());
        assertEquals("Login successful", response.getMessage());
    }

    @Test
    void testProcessGoogleAuth_NewUser_Success() {
        GoogleAuthRequest request = new GoogleAuthRequest("googleuser@example.com");

        when(userRepository.findByEmail("googleuser@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName("TRAVELER")).thenReturn(Optional.of(travelerRole));
        when(passwordEncoder.encode(anyString())).thenReturn("hashedGooglePass");

        User savedGoogleUser = new User();
        savedGoogleUser.setId(2);
        savedGoogleUser.setName("googleuser");
        savedGoogleUser.setEmail("googleuser@example.com");
        savedGoogleUser.setRole(travelerRole);
        savedGoogleUser.setOauthGoogle(true);

        when(userRepository.save(any(User.class))).thenReturn(savedGoogleUser);
        when(jwtUtil.generateToken("googleuser@example.com")).thenReturn("googleJwtToken");

        AuthResponse response = userService.processGoogleAuth(request);

        assertNotNull(response);
        assertEquals("googleJwtToken", response.getToken());
        assertEquals("googleuser@example.com", response.getEmail());
        assertEquals("Google authentication successful", response.getMessage());
    }

    @Test
    void testProcessGoogleAuth_ExistingUser_Success() {
        GoogleAuthRequest request = new GoogleAuthRequest("existinguser@example.com");

        User existingUser = new User();
        existingUser.setId(3);
        existingUser.setName("Existing User");
        existingUser.setEmail("existinguser@example.com");
        existingUser.setRole(travelerRole);
        existingUser.setOauthGoogle(false);

        when(userRepository.findByEmail("existinguser@example.com")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);
        when(jwtUtil.generateToken("existinguser@example.com")).thenReturn("existingUserToken");

        AuthResponse response = userService.processGoogleAuth(request);

        assertNotNull(response);
        assertEquals("existingUserToken", response.getToken());
        assertTrue(existingUser.getOauthGoogle());
    }

    @Test
    void testProcessGoogleAuth_NullOrEmptyToken_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> userService.processGoogleAuth(new GoogleAuthRequest("")));
        assertThrows(IllegalArgumentException.class, () -> userService.processGoogleAuth(new GoogleAuthRequest(null)));
    }
}
