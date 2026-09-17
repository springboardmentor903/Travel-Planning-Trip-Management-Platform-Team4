package com.tripnest.tripnest_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "trip_packing_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripPackingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private PackingCategory category;

    @Column(name = "is_packed", nullable = false)
    private Boolean isPacked = false;

    @Column(name = "is_custom", nullable = false)
    private Boolean isCustom = false;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isPacked == null) {
            this.isPacked = false;
        }
        if (this.isCustom == null) {
            this.isCustom = false;
        }
    }
}
