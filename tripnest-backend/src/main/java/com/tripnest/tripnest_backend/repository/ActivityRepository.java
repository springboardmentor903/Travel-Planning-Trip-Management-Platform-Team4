package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Integer> {

    List<Activity> findByItineraryDayIdOrderByStartTimeAsc(Integer itineraryDayId);

    List<Activity> findByItineraryDayIdAndItineraryDayTripUserEmailOrderByStartTimeAsc(Integer itineraryDayId, String email);

    Optional<Activity> findByIdAndItineraryDayTripUserEmail(Integer id, String email);

    Optional<Activity> findByIdAndItineraryDayIdAndItineraryDayTripUserEmail(Integer id, Integer itineraryDayId, String email);
}
