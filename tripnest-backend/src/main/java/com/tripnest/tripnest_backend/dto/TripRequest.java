package com.tripnest.tripnest_backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Destination ID is required")
    private Long destinationId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @PositiveOrZero(message = "Budget must not be negative")
    private BigDecimal budget;
}
