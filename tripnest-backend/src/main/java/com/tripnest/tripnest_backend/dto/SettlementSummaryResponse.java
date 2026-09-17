package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SettlementSummaryResponse {
    private Integer tripId;
    private BigDecimal totalExpenses;
    private int memberCount;
    private BigDecimal equalShare;
    private String currency;
    private List<MemberBalanceDTO> memberBalances;
    private List<SettlementTransactionDTO> pendingSettlements;
    private List<SettlementTransactionDTO> settledTransactions;
}
