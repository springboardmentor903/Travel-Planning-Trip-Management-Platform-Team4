package com.tripnest.tripnest_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "attractions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Attraction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id", nullable = false)
    private Destination destination;

    @Column(nullable = false)
    private String name;

    @Column(name = "short_description", length = 500)
    private String shortDescription;
}
