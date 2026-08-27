package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.CategorySummaryResponse;
import com.tripnest.tripnest_backend.dto.CreateExpenseRequest;
import com.tripnest.tripnest_backend.dto.ExpenseResponse;
import com.tripnest.tripnest_backend.dto.RemainingBudgetResponse;
import com.tripnest.tripnest_backend.dto.UpdateExpenseRequest;
import com.tripnest.tripnest_backend.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips/{tripId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @PathVariable Integer tripId,
            @Valid @RequestBody CreateExpenseRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        ExpenseResponse response = expenseService.createExpense(tripId, request, userEmail);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getExpenses(
            @PathVariable Integer tripId,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        List<ExpenseResponse> expenses = expenseService.getExpenses(tripId, userEmail);
        return ResponseEntity.ok(expenses);
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable Integer tripId,
            @PathVariable Integer expenseId,
            @Valid @RequestBody UpdateExpenseRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        ExpenseResponse response = expenseService.updateExpense(tripId, expenseId, request, userEmail);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Map<String, String>> deleteExpense(
            @PathVariable Integer tripId,
            @PathVariable Integer expenseId,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        expenseService.deleteExpense(tripId, expenseId, userEmail);
        return ResponseEntity.ok(Map.of("message", "Expense deleted successfully"));
    }

    @GetMapping("/summary")
    public ResponseEntity<List<CategorySummaryResponse>> getCategorySummary(
            @PathVariable Integer tripId,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        List<CategorySummaryResponse> summaries = expenseService.getCategorySummary(tripId, userEmail);
        return ResponseEntity.ok(summaries);
    }

    @GetMapping("/remaining-budget")
    public ResponseEntity<RemainingBudgetResponse> getRemainingBudget(
            @PathVariable Integer tripId,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        RemainingBudgetResponse response = expenseService.getRemainingBudgetDetails(tripId, userEmail);
        return ResponseEntity.ok(response);
    }
}
