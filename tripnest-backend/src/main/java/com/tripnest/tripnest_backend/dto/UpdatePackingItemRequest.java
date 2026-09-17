package com.tripnest.tripnest_backend.dto;

import com.tripnest.tripnest_backend.entity.PackingCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePackingItemRequest {
    private Boolean packed;
    private String name;
    private PackingCategory category;
}
