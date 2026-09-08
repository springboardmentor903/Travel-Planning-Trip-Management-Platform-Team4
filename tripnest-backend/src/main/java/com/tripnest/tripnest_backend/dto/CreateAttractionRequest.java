package com.tripnest.tripnest_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateAttractionRequest {
    @NotBlank(message = "Attraction name is required")
    private String name;
    private String shortDescription;
}