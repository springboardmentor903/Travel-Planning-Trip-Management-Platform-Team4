package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.MemberBalanceDTO;
import com.tripnest.tripnest_backend.dto.SettlementSummaryResponse;
import com.tripnest.tripnest_backend.dto.SettlementTransactionDTO;
import com.tripnest.tripnest_backend.entity.*;
import com.tripnest.tripnest_backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseSettlementServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private ExpenseSettlementRepository expenseSettlementRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TripMembershipRepository tripMembershipRepository;

    @Mock
    private TripAccessService tripAccessService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ExpenseSettlementService settlementService;

    private User rahul;
    private User sneha;
    private User arjun;
    private Trip trip;

    @BeforeEach
    void setUp() {
        rahul = new User();
        rahul.setId(1);
        rahul.setName("Rahul");
        rahul.setEmail("rahul@example.com");

        sneha = new User();
        sneha.setId(2);
        sneha.setName("Sneha");
        sneha.setEmail("sneha@example.com");

        arjun = new User();
        arjun.setId(3);
        arjun.setName("Arjun");
        arjun.setEmail("arjun@example.com");

        trip = new Trip();
        trip.setId(10);
        trip.setTitle("Goa Beach Trip");
        trip.setUser(rahul);
    }

    @Test
    @DisplayName("Test 3 members settlement calculation: Rahul ₹9000, Sneha ₹3000, Arjun ₹0")
    void testThreeMembersSettlementCalculation() {
        // Arrange
        TripMembership m2 = new TripMembership(1, trip, sneha, MembershipRole.MEMBER, LocalDateTime.now());
        TripMembership m3 = new TripMembership(2, trip, arjun, MembershipRole.MEMBER, LocalDateTime.now());
        when(tripMembershipRepository.findByTripId(10)).thenReturn(List.of(m2, m3));

        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));

        Expense e1 = new Expense(1, trip, null, rahul, ExpenseCategory.FOOD, new BigDecimal("9000.00"), LocalDate.now(), null, LocalDateTime.now());
        Expense e2 = new Expense(2, trip, null, sneha, ExpenseCategory.HOTEL, new BigDecimal("3000.00"), LocalDate.now(), null, LocalDateTime.now());

        when(expenseRepository.findByTripIdOrderByDateDesc(10)).thenReturn(List.of(e1, e2));
        when(expenseSettlementRepository.findByTripId(10)).thenReturn(new ArrayList<>());
        when(expenseSettlementRepository.save(any(ExpenseSettlement.class)))
                .thenAnswer(invocation -> {
                    ExpenseSettlement s = invocation.getArgument(0);
                    if (s.getId() == null) {
                        s.setId((int) (Math.random() * 1000) + 1);
                    }
                    return s;
                });

        // Act
        SettlementSummaryResponse response = settlementService.getSettlementSummary(10, "rahul@example.com");

        // Assert
        assertNotNull(response);
        assertEquals(10, response.getTripId());
        assertEquals(new BigDecimal("12000.00"), response.getTotalExpenses());
        assertEquals(3, response.getMemberCount());
        assertEquals(new BigDecimal("4000.00"), response.getEqualShare());

        // Check member balances
        MemberBalanceDTO rahulBal = response.getMemberBalances().stream().filter(b -> b.getUserId().equals(1)).findFirst().orElseThrow();
        MemberBalanceDTO snehaBal = response.getMemberBalances().stream().filter(b -> b.getUserId().equals(2)).findFirst().orElseThrow();
        MemberBalanceDTO arjunBal = response.getMemberBalances().stream().filter(b -> b.getUserId().equals(3)).findFirst().orElseThrow();

        assertEquals(new BigDecimal("9000.00"), rahulBal.getAmountPaid());
        assertEquals(new BigDecimal("5000.00"), rahulBal.getNetBalance());

        assertEquals(new BigDecimal("3000.00"), snehaBal.getAmountPaid());
        assertEquals(new BigDecimal("-1000.00"), snehaBal.getNetBalance());

        assertEquals(new BigDecimal("0.00"), arjunBal.getAmountPaid());
        assertEquals(new BigDecimal("-4000.00"), arjunBal.getNetBalance());

        // Check minimal transfers: Sneha owes Rahul ₹1000, Arjun owes Rahul ₹4000
        assertEquals(2, response.getPendingSettlements().size());

        SettlementTransactionDTO snehaToRahul = response.getPendingSettlements().stream()
                .filter(t -> t.getFromUserId().equals(2) && t.getToUserId().equals(1))
                .findFirst().orElse(null);
        assertNotNull(snehaToRahul);
        assertEquals(new BigDecimal("1000.00"), snehaToRahul.getAmount());

        SettlementTransactionDTO arjunToRahul = response.getPendingSettlements().stream()
                .filter(t -> t.getFromUserId().equals(3) && t.getToUserId().equals(1))
                .findFirst().orElse(null);
        assertNotNull(arjunToRahul);
        assertEquals(new BigDecimal("4000.00"), arjunToRahul.getAmount());
    }

    @Test
    @DisplayName("Test Zero Expenses edge case")
    void testZeroExpensesEdgeCase() {
        when(tripMembershipRepository.findByTripId(10)).thenReturn(List.of());
        when(tripRepository.findById(10)).thenReturn(Optional.of(trip));
        when(expenseRepository.findByTripIdOrderByDateDesc(10)).thenReturn(List.of());
        when(expenseSettlementRepository.findByTripId(10)).thenReturn(List.of());

        SettlementSummaryResponse response = settlementService.getSettlementSummary(10, "rahul@example.com");

        assertNotNull(response);
        assertEquals(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP), response.getTotalExpenses());
        assertEquals(1, response.getMemberCount());
        assertEquals(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP), response.getEqualShare());
        assertTrue(response.getPendingSettlements().isEmpty());
    }

    @Test
    @DisplayName("Test Mark as Settled updates transaction status")
    void testMarkAsSettled() {
        ExpenseSettlement pending = new ExpenseSettlement(100, trip, sneha, rahul, new BigDecimal("1000.00"), SettlementStatus.PENDING, LocalDateTime.now(), null);
        when(expenseSettlementRepository.findById(100)).thenReturn(Optional.of(pending));
        when(expenseSettlementRepository.save(any(ExpenseSettlement.class))).thenAnswer(i -> i.getArgument(0));

        SettlementTransactionDTO response = settlementService.markAsSettled(10, 100, "sneha@example.com");

        assertNotNull(response);
        assertEquals(100, response.getId());
        assertEquals(SettlementStatus.SETTLED, response.getStatus());
        assertNotNull(response.getSettledAt());
        verify(notificationService, times(1)).createNotification(any(User.class), anyString(), anyString(), any(), anyInt());
    }
}
