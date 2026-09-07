package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.CategorySummaryResponse;
import com.tripnest.tripnest_backend.dto.CreateExpenseRequest;
import com.tripnest.tripnest_backend.dto.ExpenseCategorySummary;
import com.tripnest.tripnest_backend.dto.ExpenseResponse;
import com.tripnest.tripnest_backend.dto.RemainingBudgetResponse;
import com.tripnest.tripnest_backend.dto.UpdateExpenseRequest;
import com.tripnest.tripnest_backend.entity.NotificationType;
import com.tripnest.tripnest_backend.entity.Budget;
import com.tripnest.tripnest_backend.entity.Expense;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.BudgetRepository;
import com.tripnest.tripnest_backend.repository.ExpenseRepository;
import com.tripnest.tripnest_backend.repository.TripMembershipRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
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
    private final TripMembershipRepository tripMembershipRepository;
    private final TripAccessService tripAccessService;
    private final NotificationService notificationService;

    @Transactional
    public ExpenseResponse createExpense(Integer tripId, CreateExpenseRequest request, String authenticatedUserEmail) {
        Trip trip = findAndValidateTripAccess(tripId, authenticatedUserEmail);

        if (request.getCategory() == null) {
            throw new IllegalArgumentException("Expense category is required");
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Expense amount must be positive");
        }
        if (request.getDate() == null) {
            throw new IllegalArgumentException("Expense date is required");
        }

        Budget budget = budgetRepository.findFirstByTripId(tripId).orElse(null);

        User payer;
        if (request.getPayerId() != null) {
            payer = userRepository.findById(request.getPayerId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid payer for trip"));
            boolean isPayerConnected = trip.getUser().getId().equals(payer.getId()) ||
                    tripMembershipRepository.existsByTripIdAndUserId(tripId, payer.getId());
            if (!isPayerConnected) {
                throw new IllegalArgumentException("Payer is not connected to this trip");
            }
        } else {
            payer = userRepository.findByEmail(authenticatedUserEmail).orElse(trip.getUser());
        }

        Expense expense = new Expense();
        expense.setTrip(trip);
        expense.setBudget(budget);
        expense.setPayer(payer);
        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setDate(request.getDate());
        expense.setReceiptLink(request.getReceiptLink());

        Expense savedExpense = expenseRepository.save(expense);

        if (!trip.getUser().getId().equals(payer.getId())) {
            notificationService.createNotification(
                    trip.getUser(),
                    "New Expense Added 💰",
                    payer.getName() + " added an expense of $" + request.getAmount() + " (" + request.getCategory() + ") to '" + trip.getTitle() + "'.",
                    NotificationType.EXPENSE_ADDED,
                    tripId
            );
        }

        return mapToResponse(savedExpense);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpenses(Integer tripId, String authenticatedUserEmail) {
        findAndValidateTripAccess(tripId, authenticatedUserEmail);
        return expenseRepository.findByTripIdOrderByDateDesc(tripId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ExpenseResponse updateExpense(Integer tripId, Integer expenseId, UpdateExpenseRequest request, String authenticatedUserEmail) {
        Trip trip = findAndValidateTripAccess(tripId, authenticatedUserEmail);

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + expenseId));

        if (!expense.getTrip().getId().equals(tripId)) {
            throw new IllegalArgumentException("Expense does not belong to trip with id: " + tripId);
        }

        if (request.getCategory() == null) {
            throw new IllegalArgumentException("Expense category is required");
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Expense amount must be positive");
        }
        if (request.getDate() == null) {
            throw new IllegalArgumentException("Expense date is required");
        }

        if (request.getPayerId() != null) {
            User payer = userRepository.findById(request.getPayerId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid payer for trip"));
            boolean isPayerConnected = trip.getUser().getId().equals(payer.getId()) ||
                    tripMembershipRepository.existsByTripIdAndUserId(tripId, payer.getId());
            if (!isPayerConnected) {
                throw new IllegalArgumentException("Payer is not connected to this trip");
            }
            expense.setPayer(payer);
        }

        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setDate(request.getDate());
        expense.setReceiptLink(request.getReceiptLink());

        Expense updatedExpense = expenseRepository.save(expense);
        return mapToResponse(updatedExpense);
    }

    @Transactional
    public void deleteExpense(Integer tripId, Integer expenseId, String authenticatedUserEmail) {
        findAndValidateTripAccess(tripId, authenticatedUserEmail);

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + expenseId));

        if (!expense.getTrip().getId().equals(tripId)) {
            throw new IllegalArgumentException("Expense does not belong to trip with id: " + tripId);
        }

        expenseRepository.delete(expense);
    }

    @Transactional(readOnly = true)
    public List<CategorySummaryResponse> getCategorySummary(Integer tripId, String authenticatedUserEmail) {
        findAndValidateTripAccess(tripId, authenticatedUserEmail);
        List<ExpenseCategorySummary> summaries = expenseRepository.findCategorySummariesByTripId(tripId);
        return summaries.stream()
                .map(s -> new CategorySummaryResponse(s.getCategory(), s.getTotalAmount()))
                .toList();
    }

    @Transactional(readOnly = true)
    public BigDecimal getRemainingBudget(Integer tripId, String authenticatedUserEmail) {
        Trip trip = findAndValidateTripAccess(tripId, authenticatedUserEmail);

        BigDecimal totalBudget = BigDecimal.ZERO;
        Budget budget = budgetRepository.findFirstByTripId(tripId).orElse(null);
        if (budget != null && budget.getTotalBudget() != null) {
            totalBudget = BigDecimal.valueOf(budget.getTotalBudget());
        } else if (trip.getBudget() != null) {
            totalBudget = BigDecimal.valueOf(trip.getBudget());
        }

        BigDecimal totalExpenses = expenseRepository.findTotalExpensesByTripId(tripId);
        if (totalExpenses == null) {
            totalExpenses = BigDecimal.ZERO;
        }

        return totalBudget.subtract(totalExpenses);
    }

    @Transactional(readOnly = true)
    public RemainingBudgetResponse getRemainingBudgetDetails(Integer tripId, String authenticatedUserEmail) {
        Trip trip = findAndValidateTripAccess(tripId, authenticatedUserEmail);

        BigDecimal totalBudget = BigDecimal.ZERO;
        Budget budget = budgetRepository.findFirstByTripId(tripId).orElse(null);
        if (budget != null && budget.getTotalBudget() != null) {
            totalBudget = BigDecimal.valueOf(budget.getTotalBudget());
        } else if (trip.getBudget() != null) {
            totalBudget = BigDecimal.valueOf(trip.getBudget());
        }

        BigDecimal totalExpenses = expenseRepository.findTotalExpensesByTripId(tripId);
        if (totalExpenses == null) {
            totalExpenses = BigDecimal.ZERO;
        }

        BigDecimal remainingBudget = totalBudget.subtract(totalExpenses);
        return new RemainingBudgetResponse(totalBudget, totalExpenses, remainingBudget);
    }

    private Trip findAndValidateTripAccess(Integer tripId, String authenticatedUserEmail) {
        tripAccessService.validateTripAccess(tripId, authenticatedUserEmail);
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        Integer budgetId = expense.getBudget() != null ? expense.getBudget().getId() : null;
        Integer payerId = expense.getPayer() != null ? expense.getPayer().getId() : null;
        String payerName = expense.getPayer() != null ? expense.getPayer().getName() : null;

        return new ExpenseResponse(
                expense.getId(),
                expense.getTrip().getId(),
                budgetId,
                payerId,
                payerName,
                expense.getCategory(),
                expense.getAmount(),
                expense.getDate(),
                expense.getReceiptLink(),
                expense.getCreatedAt()
        );
    }
}
