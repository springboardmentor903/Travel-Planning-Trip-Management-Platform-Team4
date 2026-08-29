package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.dto.ExpenseCategorySummary;
import com.tripnest.tripnest_backend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Integer> {

    List<Expense> findByTripId(Integer tripId);

    List<Expense> findByTripIdOrderByDateDesc(Integer tripId);

    List<Expense> findByTripIdAndTripUserEmail(Integer tripId, String email);

    Optional<Expense> findByIdAndTripId(Integer id, Integer tripId);

    Optional<Expense> findByIdAndTripIdAndTripUserEmail(Integer id, Integer tripId, String email);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.trip.id = :tripId")
    BigDecimal findTotalExpensesByTripId(@Param("tripId") Integer tripId);

    @Query("SELECT new com.tripnest.tripnest_backend.dto.ExpenseCategorySummary(e.category, SUM(e.amount)) " +
           "FROM Expense e WHERE e.trip.id = :tripId GROUP BY e.category")
    List<ExpenseCategorySummary> findCategorySummariesByTripId(@Param("tripId") Integer tripId);
}
