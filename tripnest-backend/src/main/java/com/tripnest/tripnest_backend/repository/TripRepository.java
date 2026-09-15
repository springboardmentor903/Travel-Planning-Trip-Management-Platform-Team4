package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.dto.DestinationAnalytics;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.TripStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Integer> {

    List<Trip> findByUserId(Integer userId);

    List<Trip> findByStartDate(LocalDate startDate);

    List<Trip> findByUserEmail(String email);

    List<Trip> findByUserIdAndDestinationId(
            Integer userId,
            Integer destinationId
    );

    Optional<Trip> findByIdAndUserId(
            Integer id,
            Integer userId
    );

    Optional<Trip> findByIdAndUserEmail(
            Integer id,
            String email
    );

    List<Trip> findByUserEmailAndStartDateAfterOrderByStartDateAsc(
            String email,
            LocalDate date
    );

    long countByUserId(Integer userId);

    @Query("SELECT SUM(t.budget) FROM Trip t WHERE t.user.id = :userId")
    Double sumBudgetByUserId(@org.springframework.data.repository.query.Param("userId") Integer userId);

    List<Trip> findTop5ByUserIdOrderByCreatedAtDesc(Integer userId);

    long countByStatus(TripStatus status);

    List<Trip> findByStatusOrderByStartDateDesc(TripStatus status);

    List<Trip> findAllByOrderByStartDateDesc();

    @Query("SELECT new com.tripnest.tripnest_backend.dto.DestinationAnalytics(d.id, d.name, COUNT(t.id)) " +
           "FROM Trip t JOIN t.destination d " +
           "GROUP BY d.id, d.name " +
           "ORDER BY COUNT(t.id) DESC, d.name ASC")
    List<DestinationAnalytics> findTopPopularDestinations(Pageable pageable);

    @Query(value = "SELECT t FROM Trip t JOIN FETCH t.user u JOIN FETCH t.destination d " +
           "WHERE (CAST(:search AS string) IS NULL OR CAST(t.id AS string) LIKE %:search% OR LOWER(u.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR LOWER(d.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:destinationId IS NULL OR d.id = :destinationId) " +
           "AND (CAST(:startDate AS date) IS NULL OR t.startDate >= :startDate) " +
           "AND (CAST(:endDate AS date) IS NULL OR t.endDate <= :endDate) " +
           "AND (:minBudget IS NULL OR t.budget >= :minBudget) " +
           "AND (:maxBudget IS NULL OR t.budget <= :maxBudget)",
           countQuery = "SELECT COUNT(t) FROM Trip t JOIN t.user u JOIN t.destination d " +
           "WHERE (CAST(:search AS string) IS NULL OR CAST(t.id AS string) LIKE %:search% OR LOWER(u.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR LOWER(d.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:destinationId IS NULL OR d.id = :destinationId) " +
           "AND (CAST(:startDate AS date) IS NULL OR t.startDate >= :startDate) " +
           "AND (CAST(:endDate AS date) IS NULL OR t.endDate <= :endDate) " +
           "AND (:minBudget IS NULL OR t.budget >= :minBudget) " +
           "AND (:maxBudget IS NULL OR t.budget <= :maxBudget)")
    org.springframework.data.domain.Page<Trip> findTripsFiltered(
            @org.springframework.data.repository.query.Param("search") String search,
            @org.springframework.data.repository.query.Param("status") TripStatus status,
            @org.springframework.data.repository.query.Param("destinationId") Integer destinationId,
            @org.springframework.data.repository.query.Param("startDate") LocalDate startDate,
            @org.springframework.data.repository.query.Param("endDate") LocalDate endDate,
            @org.springframework.data.repository.query.Param("minBudget") Double minBudget,
            @org.springframework.data.repository.query.Param("maxBudget") Double maxBudget,
            Pageable pageable
    );

    @Query("SELECT AVG(t.budget) FROM Trip t")
    Double getAverageTripBudget();

    @Query("SELECT MIN(t.budget) FROM Trip t")
    Double getMinTripBudget();

    @Query("SELECT MAX(t.budget) FROM Trip t")
    Double getMaxTripBudget();

    @Query("SELECT SUM(t.budget) FROM Trip t")
    Double getTotalPlannedBudget();

    @Query(value = "SELECT AVG(end_date - start_date) FROM trips WHERE start_date IS NOT NULL AND end_date IS NOT NULL", nativeQuery = true)
    Double getAverageTripDurationDays();

    @Query("SELECT to_char(t.createdAt, 'YYYY-MM') AS period, COUNT(t) FROM Trip t WHERE t.createdAt >= :from AND t.createdAt <= :to GROUP BY to_char(t.createdAt, 'YYYY-MM') ORDER BY period ASC")
    List<Object[]> getTripCreationTrend(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @Query("SELECT to_char(t.startDate, 'Month') AS monthName, COUNT(t) FROM Trip t WHERE t.startDate IS NOT NULL GROUP BY to_char(t.startDate, 'Month'), extract(month from t.startDate) ORDER BY extract(month from t.startDate) ASC")
    List<Object[]> getPopularTravelMonths();

    long countByCreatedAtBetween(java.time.LocalDateTime from, java.time.LocalDateTime to);
}