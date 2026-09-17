package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackingChecklistResponse {
    private Integer tripId;
    private String weatherCondition;
    private Double temperature;
    private boolean weatherAvailable;
    private String weatherSummary;
    private int totalItems;
    private int packedItems;
    private List<PackingItemDTO> items;
}
