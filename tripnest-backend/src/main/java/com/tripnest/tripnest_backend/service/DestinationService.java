package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.DestinationResponse;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DestinationService {

    private final DestinationRepository destinationRepository;

    public List<DestinationResponse> getAllDestinations() {
        return destinationRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public DestinationResponse getDestinationById(Integer id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Destination ID must be a positive integer");
        }
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + id));
        return mapToResponse(destination);
    }

    private DestinationResponse mapToResponse(Destination destination) {
        return new DestinationResponse(
                destination.getId(),
                destination.getName(),
                destination.getCountry(),
                destination.getCity(),
                destination.getDescription(),
                destination.getImageUrl(),
                destination.getCategory()
        );
    }
}
