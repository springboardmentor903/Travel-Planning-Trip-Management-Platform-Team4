package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.entity.Notification;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.TripMember;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.NotificationRepository;
import com.tripnest.tripnest_backend.repository.TripMemberRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final TripMemberRepository tripMemberRepository;

    @Transactional
    public void record(User user, String message) {
        record(user, message, null);
    }

    @Transactional
    public void record(User user, String message, String eventKey) {

        if (user == null) {
            return;
        }

        // Prevent duplicate notifications when eventKey exists
        if (eventKey != null &&
                notificationRepository.existsByUserIdAndEventKey(
                        user.getId(), eventKey)) {
            return;
        }

        Notification notification = new Notification();

        notification.setUser(user);
        notification.setMessage(message);
        notification.setEventKey(eventKey);

        notificationRepository.save(notification);
    }

    @Transactional
    public void notifyTripParticipants(
            Trip trip,
            String message,
            String eventKey,
            boolean uniquePerUser
    ) {

        if (trip == null) {
            return;
        }

        Set<Integer> notifiedUserIds = new HashSet<>();

        // Notify trip owner
        if (trip.getUser() != null) {

            String ownerEventKey = eventKey;

            if (uniquePerUser && eventKey != null) {
                ownerEventKey = eventKey + ":USER:" + trip.getUser().getId();
            }

            record(
                    trip.getUser(),
                    message,
                    ownerEventKey
            );

            notifiedUserIds.add(trip.getUser().getId());
        }

        // Notify trip members
        for (TripMember member :
                tripMemberRepository.findByTripId(trip.getId())) {

            User user = member.getUser();

            if (user == null ||
                    notifiedUserIds.contains(user.getId())) {
                continue;
            }

            String memberEventKey = eventKey;

            if (uniquePerUser && eventKey != null) {
                memberEventKey =
                        eventKey + ":USER:" + user.getId();
            }

            record(user, message, memberEventKey);

            notifiedUserIds.add(user.getId());
        }
    }
}
