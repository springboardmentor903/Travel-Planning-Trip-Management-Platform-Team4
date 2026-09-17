package com.tripnest.tripnest_backend.dto;

import com.tripnest.tripnest_backend.entity.PackingCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePackingItemRequest {

    @NotBlank(message = "Packing item name is required")
    private String name;

    @NotNull(message = "Packing category is required")
    private PackingCategory category;

    private String reason;
}
