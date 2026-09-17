package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.TripPackingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripPackingItemRepository extends JpaRepository<TripPackingItem, Integer> {

    List<TripPackingItem> findByTripId(Integer tripId);

    List<TripPackingItem> findByTripIdOrderByCategoryAsc(Integer tripId);

    boolean existsByTripId(Integer tripId);

    void deleteByTripId(Integer tripId);

    void deleteByTripIdAndIsCustom(Integer tripId, Boolean isCustom);
}
