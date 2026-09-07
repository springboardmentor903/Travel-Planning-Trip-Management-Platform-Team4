package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplyActivityRequest {

    private String title;
    private String name;
    private String description;
    private String location;
    private String startTime;
    private String endTime;

    public String getActivityTitle() {
        if (title != null && !title.trim().isEmpty()) {
            return title;
        }
        return name != null ? name : "Activity";
    }
}
