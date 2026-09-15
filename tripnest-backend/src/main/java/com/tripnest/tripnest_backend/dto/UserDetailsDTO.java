package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UserDetailsDTO extends UserAdminDTO {
    private double totalPlannedBudget;
    private List<TripResponse> recentTrips;

    public UserDetailsDTO(Integer id, String name, String email, String role, boolean active, boolean oauthGoogle, LocalDateTime createdAt, long tripCount, double totalPlannedBudget, List<TripResponse> recentTrips) {
        super(id, name, email, role, active, oauthGoogle, createdAt, tripCount);
        this.totalPlannedBudget = totalPlannedBudget;
        this.recentTrips = recentTrips;
    }
}
