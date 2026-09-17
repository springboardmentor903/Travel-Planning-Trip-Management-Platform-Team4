package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberBalanceDTO {
    private Integer userId;
    private String userName;
    private String userEmail;
    private BigDecimal amountPaid;
    private BigDecimal shouldPay;
    private BigDecimal netBalance;
}
