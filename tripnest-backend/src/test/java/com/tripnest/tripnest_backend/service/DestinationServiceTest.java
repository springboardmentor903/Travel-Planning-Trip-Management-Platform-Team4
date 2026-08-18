package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.DestinationResponse;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DestinationServiceTest {

    @Mock
    private DestinationRepository destinationRepository;

    @InjectMocks
    private DestinationService destinationService;

    private Destination destination1;
    private Destination destination2;

    @BeforeEach
    void setUp() {
        destination1 = new Destination(1, "Paris", "France", "Paris", "City of Light", "http://example.com/paris.jpg", "Metropolitan");
        destination2 = new Destination(2, "Tokyo", "Japan", "Tokyo", "Metropolis of Japan", "http://example.com/tokyo.jpg", "Metropolitan");
    }

    @Test
    void testGetAllDestinations() {
        when(destinationRepository.findAll()).thenReturn(List.of(destination1, destination2));

        List<DestinationResponse> result = destinationService.getAllDestinations();

        assertEquals(2, result.size());
        assertEquals("Paris", result.get(0).getName());
        assertEquals("Tokyo", result.get(1).getName());
        verify(destinationRepository, times(1)).findAll();
    }

    @Test
    void testGetDestinationById_ValidId() {
        when(destinationRepository.findById(1)).thenReturn(Optional.of(destination1));

        DestinationResponse result = destinationService.getDestinationById(1);

        assertNotNull(result);
        assertEquals(1, result.getId());
        assertEquals("Paris", result.getName());
        assertEquals("France", result.getCountry());
        verify(destinationRepository, times(1)).findById(1);
    }

    @Test
    void testGetDestinationById_NotFound() {
        when(destinationRepository.findById(999)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> destinationService.getDestinationById(999)
        );

        assertEquals("Destination not found with id: 999", exception.getMessage());
        verify(destinationRepository, times(1)).findById(999);
    }

    @Test
    void testGetDestinationById_InvalidId() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> destinationService.getDestinationById(-1)
        );

        assertEquals("Destination ID must be a positive integer", exception.getMessage());
        verify(destinationRepository, never()).findById(anyInt());
    }
}
