package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DestinationRepository extends JpaRepository<Destination, Integer> {

    boolean existsByName(String name);

    @Query("SELECT d FROM Destination d LEFT JOIN Trip t ON t.destination = d GROUP BY d.id, d.name, d.country, d.city, d.description, d.imageUrl, d.category ORDER BY COUNT(t.id) DESC, d.id ASC")
    List<Destination> findPopularDestinations();
}
