package com.tripnest.tripnest_backend.dto;

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
}
