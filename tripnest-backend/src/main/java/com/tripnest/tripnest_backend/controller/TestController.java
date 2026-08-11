package com.tripnest.tripnest_backend.controller;
 
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
 
@RestController
@RequestMapping("/api/test")
public class TestController {
 
    @GetMapping("/protected")
    public String protectedEndpoint(Authentication authentication) {
        return "Hello, " + authentication.getName() + "! This is a protected endpoint.";
    }
 
    @GetMapping("/traveler-only")
    @PreAuthorize("hasRole('TRAVELER')")
    public String travelerOnly(Authentication authentication) {
        return "Hello Traveler " + authentication.getName() + "!";
    }
 
    @GetMapping("/manager-only")
    @PreAuthorize("hasAnyRole('GROUP_ADMIN', 'ADMINISTRATOR')")
    public String managerOnly(Authentication authentication) {
        return "Hello " + authentication.getName() + ", you have manager-level access!";
    }
}
