package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripAdminDetailsDTO {
    private Integer id;
    private String title;
    private Integer userId;
    private String userName;
    private String userEmail;
    private String userRole;
    private Boolean userActive;
    private Boolean userOauthGoogle;
    private DestinationResponse destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double budget;
    private String notes;
    private String status;
    private String derivedStatus;
    private LocalDateTime createdAt;
}
