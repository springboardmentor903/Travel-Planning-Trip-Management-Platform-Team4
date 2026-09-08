package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.TripMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TripMemberRepository extends JpaRepository<TripMember, Integer> {
    List<TripMember> findByTripId(Integer tripId);
}
