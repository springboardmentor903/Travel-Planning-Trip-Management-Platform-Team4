package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.CategorySummaryResponse;
import com.tripnest.tripnest_backend.dto.CreateExpenseRequest;
import com.tripnest.tripnest_backend.dto.ExpenseCategorySummary;
import com.tripnest.tripnest_backend.dto.ExpenseResponse;
import com.tripnest.tripnest_backend.dto.UpdateExpenseRequest;
import com.tripnest.tripnest_backend.entity.Budget;
import com.tripnest.tripnest_backend.entity.Expense;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.BudgetRepository;
import com.tripnest.tripnest_backend.repository.ExpenseRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.tripnest.tripnest_backend.dto.*;
import com.tripnest.tripnest_backend.entity.*;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;
    private final NotificationService notificationService;

    @Transactional
    public ExpenseResponse createExpense(Integer tripId, CreateExpenseRequest request, String authenticatedUserEmail) {
        Trip trip = findAndValidateTripAccess(tripId, authenticatedUserEmail);
        validateRequest(request.getCategory(), request.getAmount(), request.getDate());
        Budget budget = budgetRepository.findFirstByTripId(tripId).orElse(null);
        User payer = resolvePayer(request.getPayerId(), trip);
        BigDecimal previousTotal = getTotalExpenses(tripId);

        Expense expense = new Expense();
        expense.setTrip(trip); expense.setBudget(budget); expense.setPayer(payer);
        expense.setCategory(request.getCategory()); expense.setAmount(request.getAmount());
        expense.setDate(request.getDate()); expense.setReceiptLink(request.getReceiptLink());
        Expense saved = expenseRepository.save(expense);
        checkBudgetThresholds(trip, previousTotal, previousTotal.add(saved.getAmount()));
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpenses(Integer tripId, String authenticatedUserEmail) {
        findAndValidateTripAccess(tripId, authenticatedUserEmail);
        return expenseRepository.findByTripIdOrderByDateDesc(tripId).stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public ExpenseResponse updateExpense(Integer tripId, Integer expenseId, UpdateExpenseRequest request, String authenticatedUserEmail) {
        Trip trip = findAndValidateTripAccess(tripId, authenticatedUserEmail);
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + expenseId));
        if (!expense.getTrip().getId().equals(tripId)) throw new IllegalArgumentException("Expense does not belong to trip with id: " + tripId);
        validateRequest(request.getCategory(), request.getAmount(), request.getDate());

        BigDecimal previousTotal = getTotalExpenses(tripId);
        BigDecimal oldAmount = expense.getAmount();
        if (request.getPayerId() != null) expense.setPayer(resolvePayer(request.getPayerId(), trip));
        expense.setCategory(request.getCategory()); expense.setAmount(request.getAmount());
        expense.setDate(request.getDate()); expense.setReceiptLink(request.getReceiptLink());
        Expense updated = expenseRepository.save(expense);
        BigDecimal newTotal = previousTotal.subtract(oldAmount).add(updated.getAmount());
        checkBudgetThresholds(trip, previousTotal, newTotal);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteExpense(Integer tripId, Integer expenseId, String authenticatedUserEmail) {
        findAndValidateTripAccess(tripId, authenticatedUserEmail);
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + expenseId));
        if (!expense.getTrip().getId().equals(tripId)) throw new IllegalArgumentException("Expense does not belong to trip with id: " + tripId);
        expenseRepository.delete(expense);
    }

    @Transactional(readOnly = true)
    public List<CategorySummaryResponse> getCategorySummary(Integer tripId, String authenticatedUserEmail) {
        findAndValidateTripAccess(tripId, authenticatedUserEmail);
        return expenseRepository.findCategorySummariesByTripId(tripId).stream()
                .map(s -> new CategorySummaryResponse(s.getCategory(), s.getTotalAmount())).toList();
    }

    @Transactional(readOnly = true)
    public BigDecimal getRemainingBudget(Integer tripId, String authenticatedUserEmail) {
        Trip trip = findAndValidateTripAccess(tripId, authenticatedUserEmail);
        return getBudgetAmount(trip).subtract(getTotalExpenses(tripId));
    }

    @Transactional(readOnly = true)
    public RemainingBudgetResponse getRemainingBudgetDetails(Integer tripId, String authenticatedUserEmail) {
        Trip trip = findAndValidateTripAccess(tripId, authenticatedUserEmail);
        BigDecimal totalBudget = getBudgetAmount(trip);
        BigDecimal totalExpenses = getTotalExpenses(tripId);
        return new RemainingBudgetResponse(totalBudget, totalExpenses, totalBudget.subtract(totalExpenses));
    }

    private void checkBudgetThresholds(Trip trip, BigDecimal before, BigDecimal after) {
        BigDecimal budget = getBudgetAmount(trip);
        if (budget.compareTo(BigDecimal.ZERO) <= 0) return;
        checkThreshold(trip, before, after, budget, 80);
        checkThreshold(trip, before, after, budget, 100);
    }

    private void checkThreshold(Trip trip, BigDecimal before, BigDecimal after, BigDecimal budget, int threshold) {
        BigDecimal limit = budget.multiply(BigDecimal.valueOf(threshold)).divide(BigDecimal.valueOf(100));
        if (before.compareTo(limit) < 0 && after.compareTo(limit) >= 0) {
            String key = "BUDGET_" + threshold + ":" + trip.getId();
            String message = "Budget alert: Trip '" + trip.getTitle() + "' has reached " + threshold + "% of its budget.";
            notificationService.notifyTripParticipants(trip, message, key, true);
        }
    }

    private BigDecimal getBudgetAmount(Trip trip) {
        Budget budget = budgetRepository.findFirstByTripId(trip.getId()).orElse(null);
        if (budget != null && budget.getTotalBudget() != null) return BigDecimal.valueOf(budget.getTotalBudget());
        if (trip.getBudget() != null) return BigDecimal.valueOf(trip.getBudget());
        return BigDecimal.ZERO;
    }

    private BigDecimal getTotalExpenses(Integer tripId) {
        BigDecimal total = expenseRepository.findTotalExpensesByTripId(tripId);
        return total == null ? BigDecimal.ZERO : total;
    }

    private User resolvePayer(Integer payerId, Trip trip) {
        if (payerId == null) return trip.getUser();
        User payer = userRepository.findById(payerId).orElseThrow(() -> new IllegalArgumentException("Invalid payer for trip"));
        if (!payer.getId().equals(trip.getUser().getId())) throw new IllegalArgumentException("Payer is not connected to this trip");
        return payer;
    }

    private void validateRequest(ExpenseCategory category, BigDecimal amount, java.time.LocalDate date) {
        if (category == null) throw new IllegalArgumentException("Expense category is required");
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) throw new IllegalArgumentException("Expense amount must be positive");
        if (date == null) throw new IllegalArgumentException("Expense date is required");
    }

    private Trip findAndValidateTripAccess(Integer tripId, String email) {
        Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        if (email != null && trip.getUser() != null && !email.equalsIgnoreCase(trip.getUser().getEmail()))
            throw new IllegalArgumentException("Unauthorized access to trip with id: " + tripId);
        return trip;
    }

    private ExpenseResponse mapToResponse(Expense e) {
        Integer budgetId = e.getBudget() != null ? e.getBudget().getId() : null;
        Integer payerId = e.getPayer() != null ? e.getPayer().getId() : null;
        String payerName = e.getPayer() != null ? e.getPayer().getName() : null;
        return new ExpenseResponse(e.getId(), e.getTrip().getId(), budgetId, payerId, payerName, e.getCategory(), e.getAmount(), e.getDate(), e.getReceiptLink(), e.getCreatedAt());
    }
}
