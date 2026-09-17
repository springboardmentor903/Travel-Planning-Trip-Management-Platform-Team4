package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminDTO {
    private Integer id;
    private String name;
    private String email;
    private String role;
    private boolean active;
    private boolean oauthGoogle;
    private LocalDateTime createdAt;
    private long tripCount;
}
