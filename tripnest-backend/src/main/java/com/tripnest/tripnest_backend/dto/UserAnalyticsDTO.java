package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAnalyticsDTO {
    private long totalUsers;
    private long newUsersInPeriod;
    private long activeUsers;
    private long travelerCount;
    private long adminCount;
    private List<UserTrendDTO> registrationTrend;
}
