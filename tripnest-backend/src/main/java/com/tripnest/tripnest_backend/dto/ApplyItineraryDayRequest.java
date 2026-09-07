package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplyItineraryDayRequest {

    private Integer dayNumber;
    private LocalDate date;
    private String title;
    private String description;
    private List<ApplyActivityRequest> activities;
}
