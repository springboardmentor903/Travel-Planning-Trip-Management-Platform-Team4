package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripAdminDTO {
    private Integer id;
    private String title;
    private Integer userId;
    private String userName;
    private String userEmail;
    private Integer destinationId;
    private String destinationName;
    private String destinationCountry;
    private String destinationImageUrl;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double budget;
    private String notes;
    private String status;
    private String derivedStatus;
    private LocalDateTime createdAt;
}
