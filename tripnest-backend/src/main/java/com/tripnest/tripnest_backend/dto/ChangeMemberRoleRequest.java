package com.tripnest.tripnest_backend.dto;

import com.tripnest.tripnest_backend.entity.MembershipRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangeMemberRoleRequest {

    @NotNull(message = "Membership role is required")
    private MembershipRole role;
}
