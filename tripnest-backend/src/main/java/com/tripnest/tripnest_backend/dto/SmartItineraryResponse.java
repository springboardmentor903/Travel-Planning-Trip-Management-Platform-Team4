package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmartItineraryResponse {

    private Integer tripId;
    private String destinationName;
    private Integer totalDays;
    private List<SuggestedDayResponse> suggestedDays;
}
