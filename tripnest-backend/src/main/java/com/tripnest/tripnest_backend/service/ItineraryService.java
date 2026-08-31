package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.CreateItineraryDayRequest;
import com.tripnest.tripnest_backend.dto.ItineraryDayResponse;
import com.tripnest.tripnest_backend.dto.UpdateItineraryDayRequest;
import com.tripnest.tripnest_backend.entity.ItineraryDay;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.ItineraryDayRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItineraryService {

    private final ItineraryDayRepository itineraryDayRepository;
    private final TripRepository tripRepository;
    private final TripAccessService tripAccessService;

    @Transactional
    public ItineraryDayResponse createItineraryDay(Integer tripId, CreateItineraryDayRequest request, String userEmail) {
        tripAccessService.validateTripManagement(tripId, userEmail);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        if (itineraryDayRepository.existsByTripIdAndDayNumber(tripId, request.getDayNumber())) {
            throw new IllegalArgumentException("An itinerary day with day number " + request.getDayNumber() + " already exists for this trip");
        }

        validateDateWithinTrip(request.getDate(), trip);

        ItineraryDay itineraryDay = new ItineraryDay();
        itineraryDay.setTrip(trip);
        itineraryDay.setDayNumber(request.getDayNumber());
        itineraryDay.setDate(request.getDate());
        itineraryDay.setTitle(request.getTitle());
        itineraryDay.setDescription(request.getDescription());

        ItineraryDay savedDay = itineraryDayRepository.save(itineraryDay);
        return mapToResponse(savedDay);
    }

    @Transactional(readOnly = true)
    public List<ItineraryDayResponse> getItineraryDays(Integer tripId, String userEmail) {
        tripAccessService.validateTripAccess(tripId, userEmail);

        return itineraryDayRepository.findByTripIdOrderByDayNumberAsc(tripId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ItineraryDayResponse getItineraryDay(Integer dayId, String userEmail) {
        ItineraryDay itineraryDay = itineraryDayRepository.findById(dayId)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary day not found with id: " + dayId));

        tripAccessService.validateTripAccess(itineraryDay.getTrip().getId(), userEmail);

        return mapToResponse(itineraryDay);
    }

    @Transactional
    public ItineraryDayResponse updateItineraryDay(Integer dayId, UpdateItineraryDayRequest request, String userEmail) {
        ItineraryDay itineraryDay = itineraryDayRepository.findById(dayId)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary day not found with id: " + dayId));

        Trip trip = itineraryDay.getTrip();
        tripAccessService.validateTripManagement(trip.getId(), userEmail);

        if (!itineraryDay.getDayNumber().equals(request.getDayNumber()) &&
                itineraryDayRepository.existsByTripIdAndDayNumber(trip.getId(), request.getDayNumber())) {
            throw new IllegalArgumentException("An itinerary day with day number " + request.getDayNumber() + " already exists for this trip");
        }

        validateDateWithinTrip(request.getDate(), trip);

        itineraryDay.setDayNumber(request.getDayNumber());
        itineraryDay.setDate(request.getDate());
        itineraryDay.setTitle(request.getTitle());
        itineraryDay.setDescription(request.getDescription());

        ItineraryDay updatedDay = itineraryDayRepository.save(itineraryDay);
        return mapToResponse(updatedDay);
    }

    @Transactional
    public void deleteItineraryDay(Integer dayId, String userEmail) {
        ItineraryDay itineraryDay = itineraryDayRepository.findById(dayId)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary day not found with id: " + dayId));

        tripAccessService.validateTripManagement(itineraryDay.getTrip().getId(), userEmail);

        itineraryDayRepository.delete(itineraryDay);
    }

    private void validateDateWithinTrip(java.time.LocalDate date, Trip trip) {
        if (date != null) {
            if (date.isBefore(trip.getStartDate()) || date.isAfter(trip.getEndDate())) {
                throw new IllegalArgumentException("Itinerary day date must be between trip start date (" +
                        trip.getStartDate() + ") and end date (" + trip.getEndDate() + ")");
            }
        }
    }

    private ItineraryDayResponse mapToResponse(ItineraryDay day) {
        return new ItineraryDayResponse(
                day.getId(),
                day.getTrip().getId(),
                day.getDayNumber(),
                day.getDate(),
                day.getTitle(),
                day.getDescription()
        );
    }
}
