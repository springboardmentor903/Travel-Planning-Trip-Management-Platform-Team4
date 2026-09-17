package com.tripnest.tripnest_backend.dto;

import com.tripnest.tripnest_backend.entity.SettlementStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SettlementTransactionDTO {
    private Integer id;
    private Integer tripId;
    private Integer fromUserId;
    private String fromUserName;
    private String fromUserEmail;
    private Integer toUserId;
    private String toUserName;
    private String toUserEmail;
    private BigDecimal amount;
    private SettlementStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime settledAt;
}
