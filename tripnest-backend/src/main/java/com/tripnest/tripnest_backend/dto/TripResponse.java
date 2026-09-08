package com.tripnest.tripnest_backend.dto;

import com.tripnest.tripnest_backend.entity.TripStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripResponse {

    private Integer id;
    private String title;
    private Integer userId;
    private String userEmail;
    private DestinationResponse destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double budget;
    private String notes;
    private LocalDateTime createdAt;
    private TripStatus status;

    public TripResponse(Integer id, String title, Integer userId, String userEmail, DestinationResponse destination, LocalDate startDate, LocalDate endDate, Double budget, String notes, LocalDateTime createdAt) {
        this(id, title, userId, userEmail, destination, startDate, endDate, budget, notes, createdAt, null);
    }
}
