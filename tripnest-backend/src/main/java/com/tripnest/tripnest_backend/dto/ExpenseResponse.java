package com.tripnest.tripnest_backend.dto;

import com.tripnest.tripnest_backend.entity.ExpenseCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {

    private Integer id;
    private Integer tripId;
    private Integer budgetId;
    private Integer payerId;
    private String payerName;
    private ExpenseCategory category;
    private BigDecimal amount;
    private LocalDate date;
    private String receiptLink;
    private LocalDateTime createdAt;
    private String tripTitle;

    public ExpenseResponse(Integer id, Integer tripId, Integer budgetId, Integer payerId, String payerName, ExpenseCategory category, BigDecimal amount, LocalDate date, String receiptLink, LocalDateTime createdAt) {
        this(id, tripId, budgetId, payerId, payerName, category, amount, date, receiptLink, createdAt, null);
    }
}

