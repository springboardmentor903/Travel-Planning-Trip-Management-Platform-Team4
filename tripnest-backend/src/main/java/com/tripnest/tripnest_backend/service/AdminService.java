package com.tripnest.tripnest_backend.service;
 
import com.tripnest.tripnest_backend.dto.UserSummaryResponse;
import com.tripnest.tripnest_backend.entity.Role;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.RoleRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
 
import java.util.List;
 
@Service
@RequiredArgsConstructor
public class AdminService {
 
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
 
    public List<UserSummaryResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserSummaryResponse(u.getId(), u.getName(), u.getEmail(), u.getRole().getName()))
                .toList();
    }
 
    public UserSummaryResponse updateUserRole(Integer userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
 
        Role newRole = roleRepository.findByName(roleName.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Role does not exist: " + roleName));
 
        user.setRole(newRole);
        User savedUser = userRepository.save(user);
 
        return new UserSummaryResponse(savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole().getName());
    }
}
