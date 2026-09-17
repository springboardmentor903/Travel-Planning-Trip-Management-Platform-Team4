package com.tripnest.tripnest_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "trips", indexes = {
    @Index(name = "idx_trips_user_id", columnList = "user_id"),
    @Index(name = "idx_trips_destination_id", columnList = "destination_id"),
    @Index(name = "idx_trips_status", columnList = "status"),
    @Index(name = "idx_trips_dates", columnList = "start_date, end_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id", nullable = false)
    private Destination destination;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "budget")
    private Double budget;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private TripStatus status = TripStatus.PLANNED;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Trip(Integer id, String title, User user, Destination destination, LocalDate startDate, LocalDate endDate, Double budget, String notes, LocalDateTime createdAt) {
        this(id, title, user, destination, startDate, endDate, budget, notes, TripStatus.PLANNED, createdAt);
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}