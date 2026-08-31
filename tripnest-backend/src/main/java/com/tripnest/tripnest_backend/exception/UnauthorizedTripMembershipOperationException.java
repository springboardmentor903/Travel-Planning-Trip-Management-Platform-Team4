package com.tripnest.tripnest_backend.exception;

public class UnauthorizedTripMembershipOperationException extends RuntimeException {
    public UnauthorizedTripMembershipOperationException(String message) {
        super(message);
    }
}
