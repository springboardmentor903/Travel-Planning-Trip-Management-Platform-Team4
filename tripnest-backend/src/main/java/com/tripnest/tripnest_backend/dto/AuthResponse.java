package com.tripnest.tripnest_backend.dto;
 
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
 
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private Integer id;
    private String name;
    private String email;
    private String role;
    private String message;
    private String token;

    public AuthResponse(Integer id, String name, String email, String message, String token) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = null;
        this.message = message;
        this.token = token;
    }
}
