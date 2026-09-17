package com.tripnest.tripnest_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "destinations", indexes = {
    @Index(name = "idx_destinations_name", columnList = "name"),
    @Index(name = "idx_destinations_category", columnList = "category")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String country;

    private String city;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    private String category;

    private Double latitude;

    private Double longitude;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "estimated_budget")
    private Double estimatedBudget;

    @Column(name = "best_travel_season")
    private String bestTravelSeason;

    public Destination(Integer id, String name, String country, String city, String description, String imageUrl, String category) {
        this.id = id;
        this.name = name;
        this.country = country;
        this.city = city;
        this.description = description;
        this.imageUrl = imageUrl;
        this.category = category;
        this.active = true;
    }

    public Destination(Integer id, String name, String country, String city, String description, String imageUrl, String category, Double latitude, Double longitude) {
        this.id = id;
        this.name = name;
        this.country = country;
        this.city = city;
        this.description = description;
        this.imageUrl = imageUrl;
        this.category = category;
        this.latitude = latitude;
        this.longitude = longitude;
        this.active = true;
    }

    public Destination(Integer id, String name, String country, String city, String description, String imageUrl, String category, Double latitude, Double longitude, Double estimatedBudget, String bestTravelSeason) {
        this.id = id;
        this.name = name;
        this.country = country;
        this.city = city;
        this.description = description;
        this.imageUrl = imageUrl;
        this.category = category;
        this.latitude = latitude;
        this.longitude = longitude;
        this.estimatedBudget = estimatedBudget;
        this.bestTravelSeason = bestTravelSeason;
        this.active = true;
    }

    @PrePersist
    protected void onCreate() {
        if (this.active == null) {
            this.active = true;
        }
    }
}
