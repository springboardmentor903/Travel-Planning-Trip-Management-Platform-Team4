package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.MemberBalanceDTO;
import com.tripnest.tripnest_backend.dto.SettlementSummaryResponse;
import com.tripnest.tripnest_backend.dto.SettlementTransactionDTO;
import com.tripnest.tripnest_backend.entity.*;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExpenseSettlementService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseSettlementRepository expenseSettlementRepository;
    private final TripRepository tripRepository;
    private final TripMembershipRepository tripMembershipRepository;
    private final TripAccessService tripAccessService;
    private final NotificationService notificationService;

    @Transactional
    public SettlementSummaryResponse getSettlementSummary(Integer tripId, String authenticatedUserEmail) {
        tripAccessService.validateTripAccess(tripId, authenticatedUserEmail);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        // 1. Gather all unique active members of the trip (Trip Owner + Joined Members)
        Map<Integer, User> membersMap = new LinkedHashMap<>();
        if (trip.getUser() != null) {
            membersMap.put(trip.getUser().getId(), trip.getUser());
        }
        List<TripMembership> memberships = tripMembershipRepository.findByTripId(tripId);
        for (TripMembership m : memberships) {
            if (m.getUser() != null) {
                membersMap.put(m.getUser().getId(), m.getUser());
            }
        }

        int memberCount = Math.max(1, membersMap.size());

        // 2. Fetch all expenses and existing settlements
        List<Expense> expenses = expenseRepository.findByTripIdOrderByDateDesc(tripId);
        List<ExpenseSettlement> existingSettlements = expenseSettlementRepository.findByTripId(tripId);

        // Sum total expenses
        BigDecimal totalExpenses = BigDecimal.ZERO;
        Map<Integer, BigDecimal> rawExpensePaidMap = new HashMap<>();
        for (Integer uid : membersMap.keySet()) {
            rawExpensePaidMap.put(uid, BigDecimal.ZERO);
        }

        for (Expense e : expenses) {
            if (e.getAmount() != null) {
                totalExpenses = totalExpenses.add(e.getAmount());
                if (e.getPayer() != null && membersMap.containsKey(e.getPayer().getId())) {
                    Integer payerId = e.getPayer().getId();
                    rawExpensePaidMap.put(payerId, rawExpensePaidMap.get(payerId).add(e.getAmount()));
                }
            }
        }

        totalExpenses = totalExpenses.setScale(2, RoundingMode.HALF_UP);
        BigDecimal equalShare = totalExpenses.divide(BigDecimal.valueOf(memberCount), 2, RoundingMode.HALF_UP);

        // Calculate settled transfers effect
        Map<Integer, BigDecimal> settlementsPaidMap = new HashMap<>();
        Map<Integer, BigDecimal> settlementsReceivedMap = new HashMap<>();
        for (Integer uid : membersMap.keySet()) {
            settlementsPaidMap.put(uid, BigDecimal.ZERO);
            settlementsReceivedMap.put(uid, BigDecimal.ZERO);
        }

        List<ExpenseSettlement> settledList = new ArrayList<>();
        List<ExpenseSettlement> existingPendingList = new ArrayList<>();

        for (ExpenseSettlement s : existingSettlements) {
            if (s.getStatus() == SettlementStatus.SETTLED) {
                settledList.add(s);
                Integer fId = s.getFromUser().getId();
                Integer tId = s.getToUser().getId();
                if (settlementsPaidMap.containsKey(fId)) {
                    settlementsPaidMap.put(fId, settlementsPaidMap.get(fId).add(s.getAmount()));
                }
                if (settlementsReceivedMap.containsKey(tId)) {
                    settlementsReceivedMap.put(tId, settlementsReceivedMap.get(tId).add(s.getAmount()));
                }
            } else {
                existingPendingList.add(s);
            }
        }

        // 3. Compute net balance for each member
        List<MemberBalanceDTO> memberBalances = new ArrayList<>();
        Map<Integer, BigDecimal> netBalanceMap = new HashMap<>();

        for (User u : membersMap.values()) {
            Integer uid = u.getId();
            BigDecimal rawPaid = rawExpensePaidMap.getOrDefault(uid, BigDecimal.ZERO);
            BigDecimal setPaid = settlementsPaidMap.getOrDefault(uid, BigDecimal.ZERO);
            BigDecimal setRec = settlementsReceivedMap.getOrDefault(uid, BigDecimal.ZERO);

            BigDecimal effectivePaid = rawPaid.add(setPaid).subtract(setRec);
            BigDecimal netBal = effectivePaid.subtract(equalShare).setScale(2, RoundingMode.HALF_UP);

            netBalanceMap.put(uid, netBal);
            memberBalances.add(new MemberBalanceDTO(
                    u.getId(),
                    u.getName(),
                    u.getEmail(),
                    rawPaid.setScale(2, RoundingMode.HALF_UP),
                    equalShare,
                    netBal
            ));
        }

        // 4. Run Minimal Transfers Algorithm (Greedy debt simplification)
        List<DebtorNode> debtors = new ArrayList<>();
        List<CreditorNode> creditors = new ArrayList<>();

        for (Map.Entry<Integer, BigDecimal> entry : netBalanceMap.entrySet()) {
            Integer uid = entry.getKey();
            BigDecimal bal = entry.getValue();
            if (bal.compareTo(new BigDecimal("-0.01")) < 0) {
                debtors.add(new DebtorNode(membersMap.get(uid), bal.abs()));
            } else if (bal.compareTo(new BigDecimal("0.01")) > 0) {
                creditors.add(new CreditorNode(membersMap.get(uid), bal));
            }
        }

        // Sort for optimal minimal transfers
        debtors.sort((a, b) -> b.remainingDebt.compareTo(a.remainingDebt));
        creditors.sort((a, b) -> b.remainingCredit.compareTo(a.remainingCredit));

        List<ExpenseSettlement> activePendingSettlements = new ArrayList<>();
        int dIdx = 0;
        int cIdx = 0;

        while (dIdx < debtors.size() && cIdx < creditors.size()) {
            DebtorNode debtor = debtors.get(dIdx);
            CreditorNode creditor = creditors.get(cIdx);

            BigDecimal transferAmount = debtor.remainingDebt.min(creditor.remainingCredit).setScale(2, RoundingMode.HALF_UP);

            if (transferAmount.compareTo(BigDecimal.ZERO) > 0) {
                // Check if a PENDING settlement already exists in DB for this pair
                Optional<ExpenseSettlement> existingOpt = expenseSettlementRepository
                        .findByTripIdAndFromUserIdAndToUserIdAndStatus(tripId, debtor.user.getId(), creditor.user.getId(), SettlementStatus.PENDING);

                ExpenseSettlement settlement;
                if (existingOpt.isPresent()) {
                    settlement = existingOpt.get();
                    if (!settlement.getAmount().equals(transferAmount)) {
                        settlement.setAmount(transferAmount);
                        settlement = expenseSettlementRepository.save(settlement);
                    }
                } else {
                    settlement = new ExpenseSettlement();
                    settlement.setTrip(trip);
                    settlement.setFromUser(debtor.user);
                    settlement.setToUser(creditor.user);
                    settlement.setAmount(transferAmount);
                    settlement.setStatus(SettlementStatus.PENDING);
                    settlement = expenseSettlementRepository.save(settlement);
                }

                activePendingSettlements.add(settlement);

                debtor.remainingDebt = debtor.remainingDebt.subtract(transferAmount);
                creditor.remainingCredit = creditor.remainingCredit.subtract(transferAmount);
            }

            if (debtor.remainingDebt.compareTo(new BigDecimal("0.01")) < 0) {
                dIdx++;
            }
            if (creditor.remainingCredit.compareTo(new BigDecimal("0.01")) < 0) {
                cIdx++;
            }
        }

        // Clean up obsolete pending settlements that are no longer part of active calculations
        Set<Integer> activePendingIds = new HashSet<>();
        for (ExpenseSettlement ps : activePendingSettlements) {
            if (ps.getId() != null) {
                activePendingIds.add(ps.getId());
            }
        }
        for (ExpenseSettlement oldPending : existingPendingList) {
            if (!activePendingIds.contains(oldPending.getId())) {
                expenseSettlementRepository.delete(oldPending);
            }
        }

        List<SettlementTransactionDTO> pendingDTOs = activePendingSettlements.stream()
                .map(this::mapToDTO)
                .toList();

        List<SettlementTransactionDTO> settledDTOs = settledList.stream()
                .map(this::mapToDTO)
                .toList();

        return new SettlementSummaryResponse(
                tripId,
                totalExpenses,
                memberCount,
                equalShare,
                "INR",
                memberBalances,
                pendingDTOs,
                settledDTOs
        );
    }

    @Transactional
    public SettlementTransactionDTO markAsSettled(Integer settlementId, String authenticatedUserEmail) {
        ExpenseSettlement settlement = expenseSettlementRepository.findById(settlementId)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement not found with id: " + settlementId));
        return markAsSettled(settlement.getTrip().getId(), settlementId, authenticatedUserEmail);
    }

    @Transactional
    public SettlementTransactionDTO markAsSettled(Integer tripId, Integer settlementId, String authenticatedUserEmail) {
        tripAccessService.validateTripAccess(tripId, authenticatedUserEmail);

        ExpenseSettlement settlement = expenseSettlementRepository.findById(settlementId)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement not found with id: " + settlementId));

        if (!settlement.getTrip().getId().equals(tripId)) {
            throw new IllegalArgumentException("Settlement does not belong to trip with id: " + tripId);
        }

        settlement.setStatus(SettlementStatus.SETTLED);
        settlement.setSettledAt(LocalDateTime.now());
        ExpenseSettlement saved = expenseSettlementRepository.save(settlement);

        // Send notification to recipient
        notificationService.createNotification(
                settlement.getToUser(),
                "Settlement Paid 🤝",
                settlement.getFromUser().getName() + " marked a settlement of ₹" + settlement.getAmount() + " as paid for '" + settlement.getTrip().getTitle() + "'.",
                NotificationType.EXPENSE_ADDED,
                tripId
        );

        return mapToDTO(saved);
    }

    private SettlementTransactionDTO mapToDTO(ExpenseSettlement s) {
        return new SettlementTransactionDTO(
                s.getId(),
                s.getTrip().getId(),
                s.getFromUser().getId(),
                s.getFromUser().getName(),
                s.getFromUser().getEmail(),
                s.getToUser().getId(),
                s.getToUser().getName(),
                s.getToUser().getEmail(),
                s.getAmount(),
                s.getStatus(),
                s.getCreatedAt(),
                s.getSettledAt()
        );
    }

    private static class DebtorNode {
        User user;
        BigDecimal remainingDebt;

        DebtorNode(User user, BigDecimal remainingDebt) {
            this.user = user;
            this.remainingDebt = remainingDebt;
        }
    }

    private static class CreditorNode {
        User user;
        BigDecimal remainingCredit;

        CreditorNode(User user, BigDecimal remainingCredit) {
            this.user = user;
            this.remainingCredit = remainingCredit;
        }
    }
}
