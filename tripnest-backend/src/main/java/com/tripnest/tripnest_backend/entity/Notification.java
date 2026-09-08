package com.tripnest.tripnest_backend.entity;

import com.tripnest.tripnest_backend.entity.Notification;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.TripMember;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.NotificationRepository;
import com.tripnest.tripnest_backend.repository.TripMemberRepository;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "notifications", uniqueConstraints = @UniqueConstraint(name = "uk_notification_user_event", columnNames = {"user_id", "event_key"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(name = "event_key", length = 200)
    private String eventKey;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }
}
