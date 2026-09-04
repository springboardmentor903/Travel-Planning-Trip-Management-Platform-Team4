package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.NotificationResponse;
import com.tripnest.tripnest_backend.dto.NotificationUnreadCountResponse;
import com.tripnest.tripnest_backend.entity.Notification;
import com.tripnest.tripnest_backend.entity.NotificationType;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.NotificationRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailNotificationService emailNotificationService;

    @Transactional
    public Notification createNotification(User recipient, String message, NotificationType type) {
        return createNotification(recipient, type != null ? type.name() : "Notification", message, type, null);
    }

    @Transactional
    public Notification createNotification(User recipient, String title, String message, NotificationType type, Integer relatedTripId) {
        if (recipient == null) {
            return null;
        }

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRelatedTripId(relatedTripId);
        notification.setRead(false);

        Notification savedNotification = notificationRepository.save(notification);

        // Attempt secondary email notification safely
        try {
            emailNotificationService.sendNotificationEmail(
                    recipient.getEmail(),
                    recipient.getName(),
                    title,
                    message
            );
        } catch (Exception ex) {
            // Silently suppress to protect primary DB notification transaction
        }

        return savedNotification;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsForCurrentUser(String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUserEmail));

        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(String currentUserEmail) {
        return getNotificationsForCurrentUser(currentUserEmail);
    }

    @Transactional(readOnly = true)
    public NotificationUnreadCountResponse getUnreadNotificationCount(String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUserEmail));

        long count = notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
        return new NotificationUnreadCountResponse(count);
    }

    @Transactional(readOnly = true)
    public NotificationUnreadCountResponse getUnreadCount(String currentUserEmail) {
        return getUnreadNotificationCount(currentUserEmail);
    }

    @Transactional
    public NotificationResponse markNotificationAsRead(Long notificationId, String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUserEmail));

        // Ownership validation: Querying by notificationId AND recipientId ensures user owns this notification
        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);
        return mapToResponse(updated);
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId, String currentUserEmail) {
        return markNotificationAsRead(notificationId, currentUserEmail);
    }

    @Transactional
    public void markAllAsRead(String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUserEmail));

        notificationRepository.markAllAsReadByRecipientId(user.getId());
    }

    @Transactional
    public void deleteNotification(Long notificationId, String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUserEmail));

        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        notificationRepository.delete(notification);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getRecipient().getId(),
                n.getType() != null ? n.getType().name() : "Notification",
                n.getMessage(),
                n.getType(),
                n.getRelatedTripId(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
