package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.MembershipRole;
import com.tripnest.tripnest_backend.entity.TripMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripMembershipRepository extends JpaRepository<TripMembership, Integer> {

    Optional<TripMembership> findByTripIdAndUserId(Integer tripId, Integer userId);

    Optional<TripMembership> findByTripIdAndUserEmail(Integer tripId, String email);

    List<TripMembership> findByTripId(Integer tripId);

    List<TripMembership> findByUserId(Integer userId);

    List<TripMembership> findByTripIdAndRole(Integer tripId, MembershipRole role);

    long countByTripIdAndRole(Integer tripId, MembershipRole role);

    boolean existsByTripIdAndUserId(Integer tripId, Integer userId);

    boolean existsByTripIdAndUserEmail(Integer tripId, String email);

    void deleteByTripIdAndUserId(Integer tripId, Integer userId);
}
