package com.affordmed.campus.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class NotificationApiResponse {

    @JsonProperty("notifications")
    private List<Notification> notifications;
}
