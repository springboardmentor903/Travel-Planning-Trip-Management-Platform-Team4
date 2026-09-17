package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.ActivityResponse;
import com.tripnest.tripnest_backend.dto.CreateActivityRequest;
import com.tripnest.tripnest_backend.dto.UpdateActivityRequest;
import com.tripnest.tripnest_backend.entity.Activity;
import com.tripnest.tripnest_backend.entity.ItineraryDay;
import com.tripnest.tripnest_backend.exception.ResourceNotFoundException;
import com.tripnest.tripnest_backend.repository.ActivityRepository;
import com.tripnest.tripnest_backend.repository.ItineraryDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ItineraryDayRepository itineraryDayRepository;
    private final TripAccessService tripAccessService;

    @Transactional
    public ActivityResponse createActivity(Integer dayId, CreateActivityRequest request, String userEmail) {
        ItineraryDay itineraryDay = itineraryDayRepository.findById(dayId)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary day not found with id: " + dayId));

        tripAccessService.validateTripAccess(itineraryDay.getTrip().getId(), userEmail);

        if (request.getStartTime() != null && request.getEndTime() != null && request.getEndTime().isBefore(request.getStartTime())) {
            throw new IllegalArgumentException("End time cannot be before start time");
        }

        Activity activity = new Activity();
        activity.setItineraryDay(itineraryDay);
        activity.setName(request.getName());
        activity.setDescription(request.getDescription());
        activity.setLocation(request.getLocation());
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());

        Activity savedActivity = activityRepository.save(activity);
        return mapToResponse(savedActivity);
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> getActivities(Integer dayId, String userEmail) {
        ItineraryDay itineraryDay = itineraryDayRepository.findById(dayId)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary day not found with id: " + dayId));

        tripAccessService.validateTripAccess(itineraryDay.getTrip().getId(), userEmail);

        return activityRepository.findByItineraryDayIdOrderByStartTimeAsc(dayId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ActivityResponse updateActivity(Integer dayId, Integer activityId, UpdateActivityRequest request, String userEmail) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found with id: " + activityId));

        if (!activity.getItineraryDay().getId().equals(dayId)) {
            throw new IllegalArgumentException("Activity does not belong to itinerary day with id: " + dayId);
        }

        tripAccessService.validateTripAccess(activity.getItineraryDay().getTrip().getId(), userEmail);

        if (request.getStartTime() != null && request.getEndTime() != null && request.getEndTime().isBefore(request.getStartTime())) {
            throw new IllegalArgumentException("End time cannot be before start time");
        }

        activity.setName(request.getName());
        activity.setDescription(request.getDescription());
        activity.setLocation(request.getLocation());
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());

        Activity updatedActivity = activityRepository.save(activity);
        return mapToResponse(updatedActivity);
    }

    @Transactional
    public void deleteActivity(Integer dayId, Integer activityId, String userEmail) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found with id: " + activityId));

        if (!activity.getItineraryDay().getId().equals(dayId)) {
            throw new IllegalArgumentException("Activity does not belong to itinerary day with id: " + dayId);
        }

        tripAccessService.validateTripAccess(activity.getItineraryDay().getTrip().getId(), userEmail);

        activityRepository.delete(activity);
    }

    private ActivityResponse mapToResponse(Activity activity) {
        return new ActivityResponse(
                activity.getId(),
                activity.getItineraryDay().getId(),
                activity.getName(),
                activity.getDescription(),
                activity.getLocation(),
                activity.getStartTime(),
                activity.getEndTime()
        );
    }
}
