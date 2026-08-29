package com.tripnest.tripnest_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateActivityRequest {

    @NotBlank(message = "Activity name is required")
    private String name;

    private String description;

    private String location;

    private LocalDateTime startTime;

    private LocalDateTime endTime;
}
