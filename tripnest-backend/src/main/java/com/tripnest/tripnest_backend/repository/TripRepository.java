package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.dto.DestinationAnalyticsResponse;
import com.tripnest.tripnest_backend.dto.DestinationVisitStatsResponse;
import com.tripnest.tripnest_backend.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Integer> {

    List<Trip> findByUserId(Integer userId);

    List<Trip> findByUserEmail(String email);

    List<Trip> findByUserIdAndDestinationId(Integer userId, Integer destinationId);

    Optional<Trip> findByIdAndUserId(Integer id, Integer userId);

    Optional<Trip> findByIdAndUserEmail(Integer id, String email);

    @Query("SELECT t FROM Trip t WHERE t.user.id = :userId AND t.startDate > :today ORDER BY t.startDate ASC")
    List<Trip> findUpcomingTripsByUserId(@Param("userId") Integer userId, @Param("today") LocalDate today);

    @Query("SELECT SUM(t.budget) FROM Trip t WHERE t.user.id = :userId")
    Double sumBudgetByUserId(@Param("userId") Integer userId);

    @Query("SELECT COUNT(t) FROM Trip t WHERE t.user.id = :userId")
    Long countTripsByUserId(@Param("userId") Integer userId);

    @Query("SELECT COUNT(DISTINCT t.destination.id) FROM Trip t WHERE t.user.id = :userId")
    Long countDistinctDestinationsByUserId(@Param("userId") Integer userId);

    @Query("SELECT new com.tripnest.tripnest_backend.dto.DestinationVisitStatsResponse(t.destination.name, COUNT(t.id)) " +
           "FROM Trip t WHERE t.user.id = :userId GROUP BY t.destination.name ORDER BY COUNT(t.id) DESC, t.destination.name ASC")
    List<DestinationVisitStatsResponse> findMostVisitedDestinationsByUserId(@Param("userId") Integer userId);

    @Query("SELECT COUNT(t) FROM Trip t WHERE t.startDate <= :today AND t.endDate >= :today")
    Long countActiveTrips(@Param("today") LocalDate today);

    @Query("SELECT COUNT(t) FROM Trip t WHERE t.endDate < :today")
    Long countCompletedTrips(@Param("today") LocalDate today);

    @Query("SELECT new com.tripnest.tripnest_backend.dto.DestinationAnalyticsResponse(t.destination.name, COUNT(t.id)) " +
           "FROM Trip t GROUP BY t.destination.name ORDER BY COUNT(t.id) DESC, t.destination.name ASC")
    List<DestinationAnalyticsResponse> findPopularDestinationAnalytics();
}