package com.tripnest.tripnest_backend.repository;
 
import com.tripnest.tripnest_backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR :search = '' OR LOWER(u.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) AND " +
           "(:role IS NULL OR :role = '' OR UPPER(u.role.name) = UPPER(CAST(:role AS string))) AND " +
           "(:active IS NULL OR u.active = :active)")
    Page<User> findUsersFiltered(@Param("search") String search,
                                 @Param("role") String role,
                                 @Param("active") Boolean active,
                                 Pageable pageable);

    long countByActiveTrue();
    long countByActiveFalse();
    long countByRole_Name(String roleName);
    long countByCreatedAtAfter(LocalDateTime date);
    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    @Query("SELECT to_char(u.createdAt, 'YYYY-MM') AS period, COUNT(u) FROM User u WHERE u.createdAt >= :from AND u.createdAt <= :to GROUP BY to_char(u.createdAt, 'YYYY-MM') ORDER BY period ASC")
    java.util.List<Object[]> getUserRegistrationTrend(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}

