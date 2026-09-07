package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmartItineraryRequest {

    private String travelStyle;
    private List<String> interests;
    private String budgetPreference;
    private String pace;
    private String preferredStartTime;
    private String foodPreference;
    private String transportationPreference;
}
