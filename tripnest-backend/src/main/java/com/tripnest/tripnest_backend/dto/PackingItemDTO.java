package com.tripnest.tripnest_backend.dto;

import com.tripnest.tripnest_backend.entity.PackingCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackingItemDTO {
    private Integer id;
    private Integer tripId;
    private String name;
    private PackingCategory category;
    private boolean packed;
    private boolean custom;
    private String reason;
}
