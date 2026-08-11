package com.tripnest.tripnest_backend.dto;
 
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
 
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryResponse {
    private Integer id;
    private String name;
    private String email;
    private String role;
}
