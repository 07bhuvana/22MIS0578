package com.affordmed.campus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriorityInboxResponse {

    private int totalFetched;
    private int topN;
    private List<Notification> priorityNotifications;
}
