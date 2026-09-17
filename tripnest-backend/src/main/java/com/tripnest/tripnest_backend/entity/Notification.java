package com.tripnest.tripnest_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notification_recipient_read", columnList = "user_id, is_read, created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User recipient;

    @Column(nullable = false, length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private NotificationType type = NotificationType.TRIP_UPDATED;

    @Column(name = "related_trip_id")
    private Integer relatedTripId;

    @Column(name = "is_read")
    private boolean isRead = false;

    public NotificationType getType() {
        return type != null ? type : NotificationType.TRIP_UPDATED;
    }

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public User getUser() {
        return recipient;
    }

    public String getEventKey() {
        return type != null ? type.name() : "EVENT";
    }

    public Notification(Long id, User recipient, String message, String typeStr, LocalDateTime createdAt) {
        this.id = id;
        this.recipient = recipient;
        this.message = message;
        this.type = NotificationType.TRIP_UPDATED;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }
}
