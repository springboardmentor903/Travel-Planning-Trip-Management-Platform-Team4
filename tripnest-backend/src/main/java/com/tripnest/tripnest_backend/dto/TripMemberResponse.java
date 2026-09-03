package com.tripnest.tripnest_backend.dto;

import com.tripnest.tripnest_backend.entity.MembershipRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripMemberResponse {

    private Integer membershipId;
    private Integer tripId;
    private Integer userId;
    private String name;
    private String email;
    private MembershipRole role;
    private LocalDateTime createdAt;
}
