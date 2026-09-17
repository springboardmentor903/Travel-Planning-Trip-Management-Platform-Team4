package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.SettlementSummaryResponse;
import com.tripnest.tripnest_backend.dto.SettlementTransactionDTO;
import com.tripnest.tripnest_backend.service.ExpenseSettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ExpenseSettlementController {

    private final ExpenseSettlementService settlementService;

    @GetMapping("/api/trips/{tripId}/settlement")
    public ResponseEntity<SettlementSummaryResponse> getSettlementSummary(
            @PathVariable Integer tripId,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        SettlementSummaryResponse response = settlementService.getSettlementSummary(tripId, userEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/trips/{tripId}/settlements")
    public ResponseEntity<SettlementSummaryResponse> getSettlements(
            @PathVariable Integer tripId,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        SettlementSummaryResponse response = settlementService.getSettlementSummary(tripId, userEmail);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/api/trips/{tripId}/settlements/{settlementId}/settle")
    public ResponseEntity<SettlementTransactionDTO> settleTransaction(
            @PathVariable Integer tripId,
            @PathVariable Integer settlementId,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        SettlementTransactionDTO response = settlementService.markAsSettled(tripId, settlementId, userEmail);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/api/settlements/{settlementId}/settle")
    public ResponseEntity<SettlementTransactionDTO> settleTransactionDirect(
            @PathVariable Integer settlementId,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        SettlementTransactionDTO response = settlementService.markAsSettled(settlementId, userEmail);
        return ResponseEntity.ok(response);
    }
}
