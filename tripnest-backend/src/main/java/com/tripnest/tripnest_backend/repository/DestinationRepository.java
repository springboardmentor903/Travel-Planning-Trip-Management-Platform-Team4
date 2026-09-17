package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.Destination;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DestinationRepository extends JpaRepository<Destination, Integer> {

    Optional<Destination> findByName(String name);

    Optional<Destination> findByNameIgnoreCase(String name);

    List<Destination> findByActiveTrue();

    long countByActiveTrue();

    long countByActiveFalse();

    @Query("SELECT d FROM Destination d WHERE " +
           "(:search IS NULL OR :search = '' OR LOWER(d.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR LOWER(d.country) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR LOWER(d.city) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) AND " +
           "(:category IS NULL OR :category = '' OR UPPER(d.category) = UPPER(CAST(:category AS string))) AND " +
           "(:active IS NULL OR d.active = :active)")
    Page<Destination> findDestinationsFiltered(@Param("search") String search,
                                                @Param("category") String category,
                                                @Param("active") Boolean active,
                                                Pageable pageable);

    @Query("SELECT d FROM Destination d LEFT JOIN Trip t ON t.destination = d GROUP BY d.id, d.name, d.country, d.city, d.description, d.imageUrl, d.category ORDER BY COUNT(t.id) DESC, d.id ASC")
    List<Destination> findPopularDestinations();

    @Query("SELECT d.category, COUNT(d) FROM Destination d GROUP BY d.category ORDER BY COUNT(d) DESC")
    List<Object[]> getCategoryDistribution();
}

