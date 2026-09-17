package com.tripnest.tripnest_backend.exception;

public class TripMemberNotFoundException extends ResourceNotFoundException {
    public TripMemberNotFoundException(String message) {
        super(message);
    }
}
