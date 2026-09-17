package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DestinationShareDTO {
    private Integer destinationId;
    private String destinationName;
    private Long tripCount;
    private double percentageShare;
}
