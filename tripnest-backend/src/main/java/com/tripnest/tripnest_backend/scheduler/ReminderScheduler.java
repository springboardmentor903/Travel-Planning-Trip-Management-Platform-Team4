package com.tripnest.tripnest_backend.scheduler;

import com.tripnest.tripnest_backend.entity.Activity;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.repository.ActivityRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.*;

@Component
@RequiredArgsConstructor
public class ReminderScheduler {
    private final TripRepository tripRepository;
    private final ActivityRepository activityRepository;
    private final NotificationService notificationService;

    // Runs every day at 09:00 server time.
    @Scheduled(cron = "0 0 9 * * *")
    public void sendTomorrowReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        for (Trip trip : tripRepository.findByStartDate(tomorrow)) {
            notificationService.notifyTripParticipants(
                    trip,
                    "Reminder: Your trip '" + trip.getTitle() + "' starts tomorrow.",
                    "TRIP_REMINDER:" + trip.getId() + ":" + tomorrow,
                    true
            );
        }

        LocalDateTime from = tomorrow.atStartOfDay();
        LocalDateTime to = tomorrow.plusDays(1).atStartOfDay();
        for (Activity activity : activityRepository.findByStartTimeGreaterThanEqualAndStartTimeLessThan(from, to)) {
            Trip trip = activity.getItineraryDay().getTrip();
            notificationService.notifyTripParticipants(
                    trip,
                    "Reminder: Activity '" + activity.getName() + "' starts tomorrow at " + activity.getStartTime().toLocalTime() + ".",
                    "ACTIVITY_REMINDER:" + activity.getId() + ":" + tomorrow,
                    true
            );
        }
    }
}
