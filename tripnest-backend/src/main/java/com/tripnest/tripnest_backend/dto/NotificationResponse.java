package com.tripnest.tripnest_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tripnest.tripnest_backend.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private Integer recipientId;
    private String title;
    private String message;
    private NotificationType type;
    private Integer relatedTripId;

    @JsonProperty("isRead")
    private boolean isRead;

    private LocalDateTime createdAt;
    private String userEmail;

    public NotificationResponse(Long id, String message, String title, LocalDateTime createdAt, String userEmail) {
        this.id = id;
        this.message = message;
        this.title = title;
        this.createdAt = createdAt;
        this.userEmail = userEmail;
    }

    public NotificationResponse(Long id, Integer recipientId, String title, String message, NotificationType type, Integer relatedTripId, boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.recipientId = recipientId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.relatedTripId = relatedTripId;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.userEmail = null;
    }
}
