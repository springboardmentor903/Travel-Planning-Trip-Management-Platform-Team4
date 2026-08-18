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

    @Transactional
    public ActivityResponse createActivity(Integer dayId, CreateActivityRequest request, String userEmail) {
        ItineraryDay itineraryDay = itineraryDayRepository.findByIdAndTripUserEmail(dayId, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary day not found with id: " + dayId));

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
        if (!itineraryDayRepository.findByIdAndTripUserEmail(dayId, userEmail).isPresent()) {
            throw new ResourceNotFoundException("Itinerary day not found with id: " + dayId);
        }

        return activityRepository.findByItineraryDayIdAndItineraryDayTripUserEmailOrderByStartTimeAsc(dayId, userEmail).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ActivityResponse updateActivity(Integer dayId, Integer activityId, UpdateActivityRequest request, String userEmail) {
        Activity activity = activityRepository.findByIdAndItineraryDayIdAndItineraryDayTripUserEmail(activityId, dayId, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found with id: " + activityId + " for itinerary day: " + dayId));

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
        Activity activity = activityRepository.findByIdAndItineraryDayIdAndItineraryDayTripUserEmail(activityId, dayId, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found with id: " + activityId + " for itinerary day: " + dayId));

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
