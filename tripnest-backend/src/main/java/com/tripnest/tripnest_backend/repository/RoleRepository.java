package com.tripnest.tripnest_backend.repository;
 
import com.tripnest.tripnest_backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
 
import java.util.Optional;
 
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(String name);
}
