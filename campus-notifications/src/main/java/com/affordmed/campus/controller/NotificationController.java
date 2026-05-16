package com.affordmed.campus.controller;

import com.affordmed.campus.config.ApiConfig;
import com.affordmed.campus.middleware.LoggingMiddleware;
import com.affordmed.campus.model.PriorityInboxResponse;
import com.affordmed.campus.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for Campus Notifications - Stage 1
 *
 * Endpoints:
 *   GET  /api/notifications/priority-inbox        → Returns top N priority notifications
 *   GET  /api/notifications/priority-inbox?n=10   → Returns top N (custom count)
 *   GET  /api/health                              → Health check
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ApiConfig apiConfig;

    @Autowired
    private LoggingMiddleware log;

    /**
     * Returns the Priority Inbox: top N unread notifications by priority score.
     *
     * Priority is based on:
     *   1. Notification Type  (Placement > Result > Event)
     *   2. Recency            (more recent = higher priority)
     *
     * @param n optional query param; defaults to configured topN (10)
     */
    @GetMapping("/notifications/priority-inbox")
    public ResponseEntity<PriorityInboxResponse> getPriorityInbox(
            @RequestParam(name = "n", required = false) Integer n) {

        int topN = (n != null && n > 0) ? n : apiConfig.getTopN();

        log.log("backend", "info", "controller",
                "Received request for priority inbox, topN=" + topN);

        try {
            PriorityInboxResponse response = notificationService.getTopPriorityNotifications(topN);
            log.log("backend", "info", "controller",
                    "Successfully returning priority inbox with "
                            + response.getPriorityNotifications().size() + " items");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.log("backend", "error", "controller",
                    "Error while building priority inbox: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Health check endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        log.log("backend", "info", "controller", "Health check endpoint called");
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "campus-notifications");
        status.put("stage", "Stage 1");
        return ResponseEntity.ok(status);
    }
}
