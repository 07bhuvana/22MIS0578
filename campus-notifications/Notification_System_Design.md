# Notification System Design

## Overview

The Campus Notifications Microservice is a backend service that consumes a real-time notification stream from the Affordmed evaluation API and exposes a **Priority Inbox** — displaying the top N most important unread notifications to the user.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Client (Browser / UI)                  │
└────────────────────────┬────────────────────────────────┘
                         │ GET /api/notifications/priority-inbox
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Spring Boot Application (Java 17)           │
│                                                          │
│  NotificationController                                  │
│       │                                                  │
│       ▼                                                  │
│  NotificationService                                     │
│       │── fetchAllNotificationsFromApi()                 │
│       │── computePriorityInbox()                         │
│       │                                                  │
│  LoggingMiddleware (called throughout)                   │
│       │── log(stack, level, package, message)            │
│       │── sends POST to /evaluation-service/logs         │
└───────┬─────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│    Affordmed Evaluation Server (4.224.186.213)           │
│    GET  /evaluation-service/notifications                │
│    POST /evaluation-service/logs                         │
│    POST /evaluation-service/register                     │
│    POST /evaluation-service/auth                         │
└─────────────────────────────────────────────────────────┘
```

---

## Priority Algorithm

### Problem

New notifications continuously arrive. The student only has time to view the top N most important ones. Priority must factor in both **type importance** and **recency**.

### Type Weights

| Type      | Weight |
|-----------|--------|
| Placement | 3      |
| Result    | 2      |
| Event     | 1      |
| Unknown   | 0      |

Placement is highest because job opportunities are time-critical and high-stakes. Result notifications are second as they affect academic standing. Events are lowest priority.

### Recency Score

All notifications are sorted by timestamp. The most recent notification receives the highest recency rank. Recency is normalized to a 0–2 range to act as a secondary tiebreaker without overpowering type weight:

```
recencyScore = (recencyRank / totalCount) * 2.0
```

### Final Score

```
priorityScore = typeWeight + recencyScore
```

Top N notifications by priorityScore are returned.

### Example

| ID | Type      | Timestamp           | typeWeight | recencyScore | Total  |
|----|-----------|---------------------|------------|--------------|--------|
| A  | Placement | 2026-04-22 17:51:18 | 3          | 1.96         | 4.96   |
| B  | Result    | 2026-04-22 17:58:54 | 2          | 2.00         | 4.00   |
| C  | Placement | 2026-04-22 17:49:42 | 3          | 1.80         | 4.80   |
| D  | Event     | 2026-04-22 17:51:00 | 1          | 1.92         | 2.92   |

Result: A > C > B > D

---

## Logging Middleware

The `LoggingMiddleware` is a reusable Spring component implementing the contract:

```java
Log(stack, level, package, message)
```

Every call:
1. Logs locally using SLF4J (visible in console/log files)
2. Sends an async POST to the test server's Log API

### Usage Examples

```java
// Informational
log.log("backend", "info", "service", "Fetching notifications from API");

// Warning
log.log("backend", "warn", "service", "API returned empty notifications list");

// Error  
log.log("backend", "error", "handler", "received string, expected bool");

// Fatal
log.log("backend", "fatal", "db", "Critical database connection failure.");
```

---

## Data Flow

1. Client calls `GET /api/notifications/priority-inbox?n=10`
2. `NotificationController` receives request, validates params, delegates to `NotificationService`
3. `NotificationService.fetchAllNotificationsFromApi()` calls the external Notification API with Bearer token
4. All notifications are returned in the response JSON
5. `computePriorityInbox()` scores each notification and returns top N
6. Response is returned to client as JSON
7. Every step logs to server via `LoggingMiddleware`

---

## Configuration

All external API details are in `application.properties`:

```properties
api.base-url=http://4.224.186.213/evaluation-service
api.auth-token=YOUR_BEARER_TOKEN
notification.top-n=10
```

---

## Scalability Considerations

- **Stateless**: No database or in-memory storage; all state fetched fresh from API each request
- **Async Logging**: Log calls to the server are non-blocking (WebFlux reactive)
- **Configurable N**: Top N is runtime-configurable via query param or properties
- **Extensible Weights**: Type weights are in a static map, easy to update or move to config
