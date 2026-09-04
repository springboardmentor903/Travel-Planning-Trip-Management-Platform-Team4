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
}
