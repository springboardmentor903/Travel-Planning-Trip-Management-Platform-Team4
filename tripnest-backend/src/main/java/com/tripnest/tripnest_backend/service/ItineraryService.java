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

import com.tripnest.tripnest_backend.dto.SmartItineraryRequest;
import com.tripnest.tripnest_backend.dto.SmartItineraryResponse;
import com.tripnest.tripnest_backend.dto.SuggestedActivityResponse;
import com.tripnest.tripnest_backend.dto.SuggestedDayResponse;
import com.tripnest.tripnest_backend.entity.Activity;
import com.tripnest.tripnest_backend.repository.ActivityRepository;
import java.util.List;
import java.util.Optional;

import com.tripnest.tripnest_backend.dto.ItinerarySuggestionResponse;

import com.tripnest.tripnest_backend.dto.ApplyActivityRequest;
import com.tripnest.tripnest_backend.dto.ApplyItineraryDayRequest;
import com.tripnest.tripnest_backend.dto.ApplyItinerarySuggestionsRequest;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ItineraryService {

    private final ItineraryDayRepository itineraryDayRepository;
    private final ActivityRepository activityRepository;
    private final TripRepository tripRepository;
    private final TripAccessService tripAccessService;
    private final SmartItineraryGeneratorService smartItineraryGeneratorService;

    @Transactional
    public List<ItineraryDayResponse> applyItinerarySuggestions(Integer tripId, ApplyItinerarySuggestionsRequest request, String userEmail) {
        tripAccessService.validateTripManagement(tripId, userEmail);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        if (request != null && request.getDays() != null) {
            for (ApplyItineraryDayRequest dayReq : request.getDays()) {
                if (dayReq == null) continue;

                Integer dayNum = dayReq.getDayNumber();
                LocalDate dayDate = dayReq.getDate() != null ? dayReq.getDate() : trip.getStartDate().plusDays(dayNum != null ? dayNum - 1 : 0);

                // Validate date boundaries
                if (dayDate.isBefore(trip.getStartDate()) || dayDate.isAfter(trip.getEndDate())) {
                    throw new IllegalArgumentException("Itinerary day date (" + dayDate + ") must be within trip dates (" + trip.getStartDate() + " to " + trip.getEndDate() + ")");
                }

                // Prevent duplicate itinerary days
                Optional<ItineraryDay> existingDayOpt = itineraryDayRepository.findByTripIdAndDayNumber(tripId, dayNum);

                ItineraryDay dayToUse;
                if (existingDayOpt.isPresent()) {
                    dayToUse = existingDayOpt.get();
                } else {
                    ItineraryDay newDay = new ItineraryDay();
                    newDay.setTrip(trip);
                    newDay.setDayNumber(dayNum);
                    newDay.setDate(dayDate);
                    newDay.setTitle(dayReq.getTitle() != null ? dayReq.getTitle() : "Day " + dayNum);
                    newDay.setDescription(dayReq.getDescription());
                    dayToUse = itineraryDayRepository.save(newDay);
                }

                if (dayReq.getActivities() != null) {
                    List<Activity> existingActivities = activityRepository.findByItineraryDayIdOrderByStartTimeAsc(dayToUse.getId());

                    for (ApplyActivityRequest actReq : dayReq.getActivities()) {
                        if (actReq == null) continue;

                        String actTitle = actReq.getActivityTitle();
                        LocalDateTime startTime = parseTimeStr(actReq.getStartTime(), dayDate);
                        LocalDateTime endTime = parseTimeStr(actReq.getEndTime(), dayDate);

                        // Validate activity time logic
                        if (startTime != null && endTime != null && endTime.isBefore(startTime)) {
                            throw new IllegalArgumentException("End time cannot be before start time for activity: " + actTitle);
                        }

                        // Check for duplicate activity to ensure idempotency
                        boolean alreadyExists = existingActivities.stream()
                                .anyMatch(existing -> existing.getName().equalsIgnoreCase(actTitle));

                        if (!alreadyExists) {
                            Activity activity = new Activity();
                            activity.setItineraryDay(dayToUse);
                            activity.setName(actTitle);
                            activity.setDescription(actReq.getDescription());
                            activity.setLocation(actReq.getLocation());
                            activity.setStartTime(startTime);
                            activity.setEndTime(endTime);
                            activityRepository.save(activity);
                        }
                    }
                }
            }
        }

        return getItineraryDays(tripId, userEmail);
    }

    private LocalDateTime parseTimeStr(String timeStr, LocalDate dayDate) {
        if (timeStr == null || timeStr.trim().isEmpty()) return null;
        String trimmed = timeStr.trim();
        try {
            if (trimmed.contains("T")) {
                return LocalDateTime.parse(trimmed);
            }
            if (trimmed.length() == 5) {
                return LocalDateTime.of(dayDate, LocalTime.parse(trimmed));
            }
            if (trimmed.length() == 8) {
                return LocalDateTime.of(dayDate, LocalTime.parse(trimmed));
            }
        } catch (Exception ignored) {}
        return null;
    }

    @Transactional(readOnly = true)
    public ItinerarySuggestionResponse getItinerarySuggestions(Integer tripId, SmartItineraryRequest request, String userEmail) {
        tripAccessService.validateTripAccess(tripId, userEmail);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        return smartItineraryGeneratorService.generateItinerarySuggestions(trip, request, userEmail);
    }

    @Transactional(readOnly = true)
    public SmartItineraryResponse generateSmartItinerary(Integer tripId, SmartItineraryRequest request, String userEmail) {
        tripAccessService.validateTripAccess(tripId, userEmail);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        return smartItineraryGeneratorService.generateSuggestions(trip, request);
    }

    @Transactional
    public List<ItineraryDayResponse> applySmartItinerary(Integer tripId, SmartItineraryResponse suggestions, String userEmail) {
        tripAccessService.validateTripManagement(tripId, userEmail);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        if (suggestions != null && suggestions.getSuggestedDays() != null) {
            for (SuggestedDayResponse suggDay : suggestions.getSuggestedDays()) {
                if (suggDay == null) continue;

                Integer dayNum = suggDay.getDayNumber();
                Optional<ItineraryDay> existingDayOpt = itineraryDayRepository.findByTripIdAndDayNumber(tripId, dayNum);

                ItineraryDay dayToUse;
                if (existingDayOpt.isPresent()) {
                    dayToUse = existingDayOpt.get();
                } else {
                    ItineraryDay newDay = new ItineraryDay();
                    newDay.setTrip(trip);
                    newDay.setDayNumber(dayNum);
                    newDay.setDate(suggDay.getDate() != null ? suggDay.getDate() : trip.getStartDate().plusDays(dayNum - 1));
                    newDay.setTitle(suggDay.getTitle());
                    newDay.setDescription(suggDay.getDescription());
                    dayToUse = itineraryDayRepository.save(newDay);
                }

                if (suggDay.getActivities() != null) {
                    for (SuggestedActivityResponse suggAct : suggDay.getActivities()) {
                        if (suggAct == null) continue;
                        Activity activity = new Activity();
                        activity.setItineraryDay(dayToUse);
                        activity.setName(suggAct.getName());
                        activity.setDescription(suggAct.getDescription());
                        activity.setLocation(suggAct.getLocation());
                        activity.setStartTime(suggAct.getStartTime());
                        activity.setEndTime(suggAct.getEndTime());
                        activityRepository.save(activity);
                    }
                }
            }
        }

        return getItineraryDays(tripId, userEmail);
    }

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
