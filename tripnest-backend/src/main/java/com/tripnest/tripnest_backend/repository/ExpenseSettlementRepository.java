package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.ExpenseSettlement;
import com.tripnest.tripnest_backend.entity.SettlementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseSettlementRepository extends JpaRepository<ExpenseSettlement, Integer> {

    List<ExpenseSettlement> findByTripId(Integer tripId);

    List<ExpenseSettlement> findByTripIdAndStatus(Integer tripId, SettlementStatus status);

    Optional<ExpenseSettlement> findByTripIdAndFromUserIdAndToUserId(Integer tripId, Integer fromUserId, Integer toUserId);

    Optional<ExpenseSettlement> findByTripIdAndFromUserIdAndToUserIdAndStatus(Integer tripId, Integer fromUserId, Integer toUserId, SettlementStatus status);

    void deleteByTripId(Integer tripId);
}
