package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripSearchResponse {
    private Integer id;
    private String title;
    private String destinationName;
    private String country;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer ownerId;
    private String ownerName;
}
