package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDistributionDTO {
    private String category;
    private long count;
    private double percentage;

    public CategoryDistributionDTO(String category, long count) {
        this.category = category;
        this.count = count;
        this.percentage = 0.0;
    }
}
