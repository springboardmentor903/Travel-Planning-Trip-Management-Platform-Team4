package com.tripnest.tripnest_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripnest.tripnest_backend.entity.Budget;

public interface BudgetRepository extends JpaRepository<Budget, Integer> {
}