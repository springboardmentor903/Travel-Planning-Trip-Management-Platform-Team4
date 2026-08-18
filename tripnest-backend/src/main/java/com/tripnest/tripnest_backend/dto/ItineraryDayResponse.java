package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryDayResponse {

    private Integer id;
    private Integer tripId;
    private Integer dayNumber;
    private LocalDate date;
    private String title;
    private String description;
}
