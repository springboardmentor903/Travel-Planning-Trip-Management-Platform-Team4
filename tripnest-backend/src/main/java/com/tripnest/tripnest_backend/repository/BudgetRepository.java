package com.tripnest.tripnest_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripnest.tripnest_backend.entity.Budget;

import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Integer> {
    Optional<Budget> findFirstByTripId(Integer tripId);
}