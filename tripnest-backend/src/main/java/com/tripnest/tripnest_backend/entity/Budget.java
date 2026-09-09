package com.tripnest.tripnest_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "budgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "total_budget", nullable = false)
    private Double totalBudget;

    @Column(name = "spent_amount")
    private Double spentAmount = 0.0;

    @Column(name = "remaining_amount")
    private Double remainingAmount;

    @PrePersist
    @PreUpdate
    protected void calculateRemainingAmount() {
        if (totalBudget != null) {
            remainingAmount = totalBudget - (spentAmount != null ? spentAmount : 0.0);
        }
    }
}