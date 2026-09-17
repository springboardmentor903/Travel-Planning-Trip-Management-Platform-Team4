package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    boolean existsByUserIdAndEventKey(Integer userId, String eventKey);
    List<Notification> findByUserEmailOrderByCreatedAtDesc(String email);
    List<Notification> findAllByOrderByCreatedAtDesc();

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Integer recipientId);
    long countByRecipientIdAndIsReadFalse(Integer recipientId);
    Optional<Notification> findByIdAndRecipientId(Long id, Integer recipientId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient.id = :recipientId")
    void markAllAsReadByRecipientId(@Param("recipientId") Integer recipientId);
}
