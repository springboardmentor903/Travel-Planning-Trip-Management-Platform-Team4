package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceItemResponse {

    private String id;
    private String name;
    private String category;
    private String address;
    private Double rating;
    private Integer userRatingsTotal;
    private String photoUrl;
}
