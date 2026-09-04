package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.Notification;
import com.tripnest.tripnest_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Fetch notifications by recipient ordered by newest first
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Integer recipientId);

    // Count unread notifications for a recipient
    long countByRecipientAndIsReadFalse(User recipient);
    long countByRecipientIdAndIsReadFalse(Integer recipientId);

    // Fetch a notification by ID and recipient for ownership validation
    Optional<Notification> findByIdAndRecipient(Long id, User recipient);
    Optional<Notification> findByIdAndRecipientId(Long id, Integer recipientId);

    // Batch mark all as read for recipient
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient.id = :recipientId AND n.isRead = false")
    int markAllAsReadByRecipientId(@Param("recipientId") Integer recipientId);
}
