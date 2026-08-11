package com.tripnest.tripnest_backend.dto;
 
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
 
@Data
public class UpdateRoleRequest {
 
    @NotBlank(message = "Role name is required")
    private String roleName;
}
