package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Integer> {

    List<Trip> findByUserId(Integer userId);

    List<Trip> findByUserEmail(String email);

    List<Trip> findByUserIdAndDestinationId(Integer userId, Integer destinationId);

    Optional<Trip> findByIdAndUserId(Integer id, Integer userId);

    Optional<Trip> findByIdAndUserEmail(Integer id, String email);
}
