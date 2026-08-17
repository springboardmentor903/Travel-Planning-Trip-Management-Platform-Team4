package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DestinationRepository extends JpaRepository<Destination, Integer> {
}
