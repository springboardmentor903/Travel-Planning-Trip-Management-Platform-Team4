package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.CreateExpenseRequest;
import com.tripnest.tripnest_backend.dto.ExpenseResponse;
import com.tripnest.tripnest_backend.entity.*;
import com.tripnest.tripnest_backend.repository.BudgetRepository;
import com.tripnest.tripnest_backend.repository.ExpenseRepository;
import com.tripnest.tripnest_backend.repository.TripMembershipRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private TripMembershipRepository tripMembershipRepository;

    @Mock
    private TripAccessService tripAccessService;

    @InjectMocks
    private ExpenseService expenseService;

    private User owner;
    private User member;
    private Trip trip;
    private Expense expense;

    @BeforeEach
    void setUp() {
        Role role = new Role(1, "TRAVELER");
        owner = new User(1, "Owner", "owner@example.com", "hash", role, false, LocalDateTime.now());
        member = new User(2, "Member", "member@example.com", "hash", role, false, LocalDateTime.now());
        Destination destination = new Destination(1, "Rome", "Italy", "Rome", "Desc", "url", "City");
        trip = new Trip(100, "Rome Trip", owner, destination, LocalDate.now().plusDays(1), LocalDate.now().plusDays(5), 1000.0, "Notes", LocalDateTime.now());
        expense = new Expense(1, trip, null, member, ExpenseCategory.FOOD, BigDecimal.valueOf(50.0), LocalDate.now(), null, LocalDateTime.now());
    }

    @Test
    void testCreateExpense_Member_Success() {
        CreateExpenseRequest request = new CreateExpenseRequest(ExpenseCategory.FOOD, BigDecimal.valueOf(50.0), LocalDate.now(), null, 2);

        doNothing().when(tripAccessService).validateTripAccess(100, "member@example.com");
        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));
        when(budgetRepository.findFirstByTripId(100)).thenReturn(Optional.empty());
        when(userRepository.findById(2)).thenReturn(Optional.of(member));
        when(tripMembershipRepository.existsByTripIdAndUserId(100, 2)).thenReturn(true);
        when(expenseRepository.save(any(Expense.class))).thenReturn(expense);

        ExpenseResponse response = expenseService.createExpense(100, request, "member@example.com");

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(50.0), response.getAmount());
        assertEquals(ExpenseCategory.FOOD, response.getCategory());
        assertEquals(2, response.getPayerId());
    }

    @Test
    void testGetExpenses_Member_Success() {
        doNothing().when(tripAccessService).validateTripAccess(100, "member@example.com");
        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));
        when(expenseRepository.findByTripIdOrderByDateDesc(100)).thenReturn(List.of(expense));

        List<ExpenseResponse> expenses = expenseService.getExpenses(100, "member@example.com");

        assertEquals(1, expenses.size());
        assertEquals(ExpenseCategory.FOOD, expenses.get(0).getCategory());
    }

    @Test
    void testDeleteExpense_Member_Success() {
        doNothing().when(tripAccessService).validateTripAccess(100, "member@example.com");
        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));
        when(expenseRepository.findById(1)).thenReturn(Optional.of(expense));

        expenseService.deleteExpense(100, 1, "member@example.com");

        verify(expenseRepository, times(1)).delete(expense);
    }
}
