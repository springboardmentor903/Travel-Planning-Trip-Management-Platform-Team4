package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.*;
import com.tripnest.tripnest_backend.entity.*;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttractionService {
    private final AttractionRepository attractionRepository;
    private final DestinationRepository destinationRepository;

    @Transactional(readOnly = true)
    public List<AttractionResponse> getByDestination(Integer destinationId) {
        if (!destinationRepository.existsById(destinationId)) {
            throw new ResourceNotFoundException("Destination not found with id: " + destinationId);
        }
        return attractionRepository.findByDestinationIdOrderByNameAsc(destinationId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public AttractionResponse create(Integer destinationId, CreateAttractionRequest request) {
        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + destinationId));
        Attraction attraction = new Attraction();
        attraction.setDestination(destination);
        attraction.setName(request.getName().trim());
        attraction.setShortDescription(request.getShortDescription());
        return toResponse(attractionRepository.save(attraction));
    }

    private AttractionResponse toResponse(Attraction a) {
        return new AttractionResponse(a.getId(), a.getDestination().getId(), a.getName(), a.getShortDescription());
    }
}

