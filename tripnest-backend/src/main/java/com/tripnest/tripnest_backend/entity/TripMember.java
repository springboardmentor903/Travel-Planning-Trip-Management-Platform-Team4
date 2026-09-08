package com.tripnest.tripnest_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trip_members", uniqueConstraints = @UniqueConstraint(columnNames = {"trip_id", "user_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TripMember {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
