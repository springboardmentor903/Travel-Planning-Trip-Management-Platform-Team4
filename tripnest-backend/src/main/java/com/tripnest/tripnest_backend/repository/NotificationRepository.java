package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    boolean existsByUserIdAndEventKey(Integer userId, String eventKey);
    List<Notification> findByUserEmailOrderByCreatedAtDesc(String email);
}
