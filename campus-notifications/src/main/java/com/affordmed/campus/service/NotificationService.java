package com.affordmed.campus.service;

import com.affordmed.campus.config.ApiConfig;
import com.affordmed.campus.middleware.LoggingMiddleware;
import com.affordmed.campus.model.Notification;
import com.affordmed.campus.model.NotificationApiResponse;
import com.affordmed.campus.model.PriorityInboxResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service layer for handling campus notification business logic.
 *
 * Priority Inbox Logic:
 *   Priority Score = placement(weight) + result(weight) + event(weight) + recency(weight)
 *
 * Type Weights (higher = more important):
 *   Placement  → 3
 *   Result     → 2
 *   Event      → 1
 *
 * Recency: More recent notifications get higher scores.
 * Final: Top N by composite score are returned.
 */
@Service
public class NotificationService {

    private static final Map<String, Integer> TYPE_WEIGHT = new HashMap<>();

    static {
        TYPE_WEIGHT.put("Placement", 3);
        TYPE_WEIGHT.put("Result", 2);
        TYPE_WEIGHT.put("Event", 1);
    }

    @Autowired
    private WebClient webClient;

    @Autowired
    private ApiConfig apiConfig;

    @Autowired
    private LoggingMiddleware log;

    /**
     * Fetches all notifications from external API and returns top N by priority.
     *
     * @param topN number of top priority notifications to return
     * @return PriorityInboxResponse with ranked notifications
     */
    public PriorityInboxResponse getTopPriorityNotifications(int topN) {
        log.log("backend", "info", "service",
                "Starting getTopPriorityNotifications, requested top=" + topN);

        List<Notification> allNotifications = fetchAllNotificationsFromApi();

        log.log("backend", "info", "service",
                "Fetched total notifications from API: " + allNotifications.size());

        if (allNotifications.isEmpty()) {
            log.log("backend", "warn", "service",
                    "No notifications returned from API, returning empty priority inbox");
            return new PriorityInboxResponse(0, topN, Collections.emptyList());
        }

        List<Notification> topPriority = computePriorityInbox(allNotifications, topN);

        log.log("backend", "info", "service",
                "Priority inbox computed. Returning top " + topPriority.size() + " notifications");

        return new PriorityInboxResponse(allNotifications.size(), topN, topPriority);
    }

    /**
     * Fetches all notifications from the external evaluation service API.
     * The API is a protected route requiring Bearer token.
     */
    private List<Notification> fetchAllNotificationsFromApi() {
        log.log("backend", "info", "service",
                "Calling external Notification API: " + apiConfig.getBaseUrl() + "/notifications");
        try {
            NotificationApiResponse response = webClient.get()
                    .uri(apiConfig.getBaseUrl() + "/notifications")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiConfig.getAuthToken())
                    .retrieve()
                    .bodyToMono(NotificationApiResponse.class)
                    .block();

            if (response == null || response.getNotifications() == null) {
                log.log("backend", "warn", "service",
                        "API response or notifications list is null");
                return Collections.emptyList();
            }

            log.log("backend", "debug", "service",
                    "Raw notifications count from API: " + response.getNotifications().size());

            return response.getNotifications();

        } catch (WebClientResponseException e) {
            log.log("backend", "error", "service",
                    "API call failed with HTTP status: " + e.getStatusCode()
                            + " | Body: " + e.getResponseBodyAsString());
            return Collections.emptyList();
        } catch (Exception e) {
            log.log("backend", "fatal", "service",
                    "Unexpected error while fetching notifications: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Core algorithm: Computes priority score for each notification and returns top N.
     *
     * Score = typeWeight + recencyScore
     *
     * typeWeight:  Placement=3, Result=2, Event=1, unknown=0
     * recencyScore: Computed by ranking notifications by timestamp; most recent gets highest rank.
     *               recencyScore = (index_from_newest + 1) * recencyMultiplier
     *
     * This ensures both type importance AND recency are factored.
     */
    private List<Notification> computePriorityInbox(List<Notification> notifications, int topN) {
        log.log("backend", "info", "service",
                "Computing priority scores for " + notifications.size() + " notifications");

        // Sort by timestamp descending to assign recency ranks
        List<Notification> sortedByRecency = notifications.stream()
                .sorted((a, b) -> compareTimestamps(b.getTimestamp(), a.getTimestamp()))
                .collect(Collectors.toList());

        // Build a recency rank map: most recent = highest rank
        Map<String, Integer> recencyRankMap = new LinkedHashMap<>();
        for (int i = 0; i < sortedByRecency.size(); i++) {
            // Most recent notification (i=0) gets rank = size, oldest gets rank = 1
            recencyRankMap.put(sortedByRecency.get(i).getId(), sortedByRecency.size() - i);
        }

        // Compute composite priority score for each notification
        Map<Notification, Double> scoreMap = new LinkedHashMap<>();
        for (Notification n : notifications) {
            int typeWeight = TYPE_WEIGHT.getOrDefault(n.getType(), 0);
            int recencyRank = recencyRankMap.getOrDefault(n.getId(), 0);

            // Weighted composite: typeWeight has higher influence
            // Normalize recencyRank to 0-1 range and multiply by 2 for secondary weight
            double recencyScore = (double) recencyRank / sortedByRecency.size() * 2.0;
            double totalScore = typeWeight + recencyScore;

            scoreMap.put(n, totalScore);

            log.log("backend", "debug", "service",
                    "Notification ID=" + n.getId() + " | Type=" + n.getType()
                            + " | typeWeight=" + typeWeight
                            + " | recencyRank=" + recencyRank
                            + " | totalScore=" + String.format("%.4f", totalScore));
        }

        // Sort by score descending, pick top N
        List<Notification> topNotifications = scoreMap.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(topN)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        log.log("backend", "info", "service",
                "Top " + topNotifications.size() + " priority notifications selected");

        return topNotifications;
    }

    /**
     * Compares two ISO-format timestamp strings.
     * Returns negative if a < b, zero if equal, positive if a > b.
     */
    private int compareTimestamps(String a, String b) {
        try {
            LocalDateTime dtA = parseTimestamp(a);
            LocalDateTime dtB = parseTimestamp(b);
            return dtA.compareTo(dtB);
        } catch (Exception e) {
            log.log("backend", "warn", "service",
                    "Timestamp parse error comparing '" + a + "' vs '" + b + "': " + e.getMessage());
            return 0;
        }
    }

    /**
     * Parses timestamps in multiple formats from the API response.
     * Handles: "2026-04-22 17:51:30" and ISO variants.
     */
    private LocalDateTime parseTimestamp(String timestamp) {
        if (timestamp == null || timestamp.isBlank()) {
            throw new DateTimeParseException("Null or blank timestamp", timestamp, 0);
        }
        // Try standard space-separated format from API
        try {
            return LocalDateTime.parse(timestamp,
                    DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        } catch (DateTimeParseException ignored) {}

        // Try ISO format
        try {
            return LocalDateTime.parse(timestamp, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (DateTimeParseException ignored) {}

        // Fallback: trim and retry
        return LocalDateTime.parse(timestamp.trim(),
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
}
