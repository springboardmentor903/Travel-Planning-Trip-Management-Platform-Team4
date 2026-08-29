package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.ItineraryDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItineraryDayRepository extends JpaRepository<ItineraryDay, Integer> {

    List<ItineraryDay> findByTripIdOrderByDayNumberAsc(Integer tripId);

    List<ItineraryDay> findByTripIdAndTripUserEmailOrderByDayNumberAsc(Integer tripId, String email);

    Optional<ItineraryDay> findByIdAndTripUserEmail(Integer id, String email);

    Optional<ItineraryDay> findByTripIdAndDayNumberAndTripUserEmail(Integer tripId, Integer dayNumber, String email);

    boolean existsByTripIdAndDayNumber(Integer tripId, Integer dayNumber);
}
