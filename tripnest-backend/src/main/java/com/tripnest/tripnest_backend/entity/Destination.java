package com.tripnest.tripnest_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "destinations")
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
}
