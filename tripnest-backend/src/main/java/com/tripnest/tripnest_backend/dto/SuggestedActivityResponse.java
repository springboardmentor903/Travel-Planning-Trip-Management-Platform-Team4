package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuggestedActivityResponse {

    private String name;
    private String description;
    private String location;
    private String category;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String estimatedDuration;
    private String estimatedCost;
}
