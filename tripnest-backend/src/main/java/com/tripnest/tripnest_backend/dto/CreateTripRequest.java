package com.tripnest.tripnest_backend.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTripRequest {

    @NotBlank(message = "Trip title is required")
    private String title;

    @NotNull(message = "Destination ID is required")
    private Integer destinationId;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @FutureOrPresent(message = "End date must be today or in the future")
    private LocalDate endDate;

    private Double budget;

    private String notes;
}
