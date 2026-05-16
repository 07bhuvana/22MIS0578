# Campus Notifications Microservice

> Affordmed - Campus Notification Platform | Stage 1 Backend

## Tech Stack

- **Language**: Java 17
- **Framework**: Spring Boot 3.2
- **HTTP Client**: WebFlux (WebClient)
- **Build Tool**: Maven
- **Logging**: SLF4J + Custom Logging Middleware (sends logs to test server)

---

## Project Structure

```
campus-notifications/
├── src/
│   └── main/
│       ├── java/com/affordmed/campus/
│       │   ├── CampusNotificationsApplication.java     ← Entry point
│       │   ├── config/
│       │   │   ├── ApiConfig.java                      ← Reads application.properties
│       │   │   └── WebClientConfig.java                ← HTTP client bean
│       │   ├── controller/
│       │   │   ├── NotificationController.java         ← Priority inbox API
│       │   │   └── RegistrationController.java         ← Setup/auth endpoints
│       │   ├── middleware/
│       │   │   └── LoggingMiddleware.java              ← Reusable Log() function
│       │   ├── model/
│       │   │   ├── Notification.java
│       │   │   ├── NotificationApiResponse.java
│       │   │   ├── PriorityInboxResponse.java
│       │   │   └── LogRequest.java
│       │   └── service/
│       │       ├── NotificationService.java            ← Priority algorithm
│       │       └── RegistrationService.java            ← Registration + auth
│       └── resources/
│           └── application.properties
├── .gitignore
├── pom.xml
└── README.md
```

---

## Setup Instructions (From Scratch)

### Prerequisites

- Java 17+ installed (`java -version`)
- Maven 3.8+ installed (`mvn -version`)
- Git installed (`git --version`)
- IntelliJ IDEA or VS Code with Java extension

---

### Step 1 — Clone / Initialize the Project

```bash
# If starting fresh:
git init campus-notifications
cd campus-notifications

# OR clone your GitHub repo first:
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

Place all project files inside this directory (matching the structure above).

---

### Step 2 — Register with the Test Server

You need to do this **ONCE** to get your `clientID` and `clientSecret`.

**Option A — Use the API endpoint (start the app first, then call):**

```http
POST http://localhost:8080/api/setup/register
Content-Type: application/json

{
  "email": "yourname@yourcollege.edu",
  "name": "Your Full Name",
  "mobileNo": "9999999999",
  "githubUsername": "yourgithubusername",
  "rollNo": "yourrollnumber",
  "accessCode": "access-code-from-email"
}
```

**Option B — Use curl directly:**

```bash
curl -X POST http://4.224.186.213/evaluation-service/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yourname@college.edu",
    "name": "Your Name",
    "mobileNo": "9999999999",
    "githubUsername": "yourgithubusername",
    "rollNo": "yourrollno",
    "accessCode": "your-access-code"
  }'
```

**Response (SAVE THIS — you cannot retrieve it again):**
```json
{
  "email": "yourname@college.edu",
  "name": "Your Name",
  "rollNo": "yourrollno",
  "accessCode": "your-access-code",
  "clientID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxx"
}
```

---

### Step 3 — Get Bearer Auth Token

```http
POST http://localhost:8080/api/setup/auth
Content-Type: application/json

{
  "email": "yourname@college.edu",
  "name": "Your Name",
  "rollNo": "yourrollno",
  "accessCode": "your-access-code",
  "clientID": "clientid-from-step-2",
  "clientSecret": "clientsecret-from-step-2"
}
```

Or directly:
```bash
curl -X POST http://4.224.186.213/evaluation-service/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yourname@college.edu",
    "name": "Your Name",
    "rollNo": "yourrollno",
    "accessCode": "your-access-code",
    "clientID": "your-client-id",
    "clientSecret": "your-client-secret"
  }'
```

Response:
```json
{
  "token_type": "Bearer",
  "access_token": "eyJhbGciOiJI..."
}
```

---

### Step 4 — Update application.properties

Open `src/main/resources/application.properties` and fill in:

```properties
api.client-id=YOUR_ACTUAL_CLIENT_ID
api.client-secret=YOUR_ACTUAL_CLIENT_SECRET
api.access-code=YOUR_ACTUAL_ACCESS_CODE
api.auth-token=YOUR_ACTUAL_BEARER_TOKEN
```

---

### Step 5 — Build and Run

```bash
# Build
mvn clean install

# Run
mvn spring-boot:run

# OR build JAR and run
mvn clean package
java -jar target/campus-notifications-0.0.1-SNAPSHOT.jar
```

The app starts at: **http://localhost:8080**

---

## API Endpoints

### Priority Inbox (Stage 1)

```
GET /api/notifications/priority-inbox
GET /api/notifications/priority-inbox?n=10
```

Returns top N priority notifications. Default N = 10 (configurable via `notification.top-n`).

**Response:**
```json
{
  "totalFetched": 50,
  "topN": 10,
  "priorityNotifications": [
    {
      "ID": "abc-123",
      "Type": "Placement",
      "Message": "TCS Corporation hiring",
      "Timestamp": "2026-04-22 17:51:18"
    }
  ]
}
```

### Health Check

```
GET /api/health
```

---

## Priority Algorithm (Stage 1)

The Priority Score is a composite of:

| Factor | Weight |
|--------|--------|
| Type: Placement | 3 |
| Type: Result | 2 |
| Type: Event | 1 |
| Recency | 0–2 (normalized) |

**Formula:**
```
score = typeWeight + (recencyRank / totalCount) * 2.0
```

Most recent notifications with highest-priority type rank first.

---

## Logging Middleware

Every significant action in the code calls:

```java
log.log("backend", "info", "service", "Descriptive message here");
log.log("backend", "error", "handler", "received string, expected bool");
log.log("backend", "fatal", "db", "Critical database connection failure.");
```

This sends a POST request to the test server's Log API and also logs locally via SLF4J.

**Log API:** `POST http://4.224.186.213/evaluation-service/logs`

---

## Push to GitHub

```bash
git add .
git commit -m "Stage 1: Priority inbox + logging middleware"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Notes

- `.DS_Store` files are in `.gitignore` and will NOT be pushed to GitHub.
- Do NOT commit `application.properties` with real credentials — add it to `.gitignore` or use env vars for production.
- Registration is a one-time operation. Store your `clientID` and `clientSecret` safely.
