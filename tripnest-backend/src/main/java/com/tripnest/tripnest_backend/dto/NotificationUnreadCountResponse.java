package com.tripnest.tripnest_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationUnreadCountResponse {

    @JsonProperty("count")
    private long count;

    public long getUnreadCount() {
        return count;
    }

    public void setUnreadCount(long unreadCount) {
        this.count = unreadCount;
    }
}
