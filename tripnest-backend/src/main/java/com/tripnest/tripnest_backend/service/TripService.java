package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.CreateTripRequest;
import com.tripnest.tripnest_backend.dto.DestinationResponse;
import com.tripnest.tripnest_backend.dto.TripResponse;
import com.tripnest.tripnest_backend.dto.UpdateTripRequest;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.TripStatus;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final NotificationService notificationService;

    @Transactional
    public TripResponse createTrip(CreateTripRequest request, String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + userEmail));

        Destination destination = destinationRepository
                .findById(request.getDestinationId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Destination not found with id: "
                                        + request.getDestinationId()));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException(
                    "End date cannot be before start date");
        }

        Trip trip = new Trip();
        trip.setTitle(request.getTitle());
        trip.setUser(user);
        trip.setDestination(destination);
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setBudget(request.getBudget());
        trip.setNotes(request.getNotes());

        trip.setStatus(calculateStatus(trip));

        Trip savedTrip = tripRepository.save(trip);

        notificationService.record(
                user,
                "Trip created: " + savedTrip.getTitle()
        );

        return mapToResponse(savedTrip);
    }

    @Transactional(readOnly = true)
    public List<TripResponse> getUserTrips(String userEmail) {

        return tripRepository.findByUserEmail(userEmail)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TripResponse getTripById(Integer id, String userEmail) {

        Trip trip = tripRepository
                .findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Trip not found with id: " + id));

        return mapToResponse(trip);
    }

    @Transactional
    public TripResponse updateTrip(
            Integer id,
            UpdateTripRequest request,
            String userEmail) {

        Trip trip = tripRepository
                .findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Trip not found with id: " + id));

        Destination destination = destinationRepository
                .findById(request.getDestinationId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Destination not found with id: "
                                        + request.getDestinationId()));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException(
                    "End date cannot be before start date");
        }

        boolean destinationChanged =
                !trip.getDestination().getId().equals(destination.getId());

        boolean datesChanged =
                !trip.getStartDate().equals(request.getStartDate())
                        || !trip.getEndDate().equals(request.getEndDate());

        trip.setTitle(request.getTitle());
        trip.setDestination(destination);
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setBudget(request.getBudget());
        trip.setNotes(request.getNotes());

        trip.setStatus(calculateStatus(trip));

        Trip updatedTrip = tripRepository.save(trip);

        if (destinationChanged || datesChanged) {
            notificationService.notifyTripParticipants(
                    updatedTrip,
                    "Travel update: Core details for trip '"
                            + updatedTrip.getTitle()
                            + "' have changed.",
                    null,
                    false
            );
        }

        return mapToResponse(updatedTrip);
    }

    @Transactional
    public void deleteTrip(Integer id, String userEmail) {

        Trip trip = tripRepository
                .findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Trip not found with id: " + id));

        tripRepository.delete(trip);
    }

    private TripStatus calculateStatus(Trip trip) {

        LocalDate today = LocalDate.now();

        if (trip.getEndDate().isBefore(today)) {
            return TripStatus.COMPLETED;
        }

        if (!trip.getStartDate().isAfter(today)) {
            return TripStatus.ACTIVE;
        }

        return TripStatus.PLANNED;
    }

    private TripResponse mapToResponse(Trip trip) {

        Destination d = trip.getDestination();

        DestinationResponse destinationResponse =
                new DestinationResponse(
                        d.getId(),
                        d.getName(),
                        d.getCountry(),
                        d.getCity(),
                        d.getDescription(),
                        d.getImageUrl(),
                        d.getCategory()
                );

        return new TripResponse(
                trip.getId(),
                trip.getTitle(),
                trip.getUser().getId(),
                trip.getUser().getEmail(),
                destinationResponse,
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getBudget(),
                trip.getNotes(),
                trip.getCreatedAt(),
                trip.getStatus()
        );
    }
}