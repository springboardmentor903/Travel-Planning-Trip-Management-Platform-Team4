package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.JoinRequest;
import com.tripnest.tripnest_backend.entity.JoinRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JoinRequestRepository extends JpaRepository<JoinRequest, Integer> {

    Optional<JoinRequest> findByTripIdAndRequesterIdAndStatus(Integer tripId, Integer requesterId, JoinRequestStatus status);

    boolean existsByTripIdAndRequesterIdAndStatus(Integer tripId, Integer requesterId, JoinRequestStatus status);

    List<JoinRequest> findByTripIdAndStatus(Integer tripId, JoinRequestStatus status);

    List<JoinRequest> findByTripId(Integer tripId);

    Optional<JoinRequest> findByIdAndTripId(Integer id, Integer tripId);
}
