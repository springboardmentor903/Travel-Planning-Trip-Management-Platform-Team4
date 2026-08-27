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
}
