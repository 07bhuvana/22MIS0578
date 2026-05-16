package com.affordmed.campus.controller;

import com.affordmed.campus.middleware.LoggingMiddleware;
import com.affordmed.campus.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for Registration and Authentication with the Affordmed Test Server.
 *
 * Use these endpoints ONCE to register and get your auth token.
 * After getting token, put it in application.properties → api.auth-token
 *
 * IMPORTANT:
 *   - Replace placeholder values in the request body with YOUR real details.
 *   - Registration can only be done ONCE.
 *   - Save clientID and clientSecret from registration response permanently.
 */
@RestController
@RequestMapping("/api/setup")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private LoggingMiddleware log;

    /**
     * POST /api/setup/register
     *
     * Body:
     * {
     *   "email": "yourname@college.edu",
     *   "name": "Your Name",
     *   "mobileNo": "9999999999",
     *   "githubUsername": "yourgithubusername",
     *   "rollNo": "yourrollno",
     *   "accessCode": "your-access-code-from-email"
     * }
     */
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Map<String, String> body) {
        log.log("backend", "info", "registration-controller",
                "Register endpoint called for email=" + body.get("email"));

        String result = registrationService.register(
                body.get("email"),
                body.get("name"),
                body.get("mobileNo"),
                body.get("githubUsername"),
                body.get("rollNo"),
                body.get("accessCode")
        );
        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/setup/auth
     *
     * Body:
     * {
     *   "email": "yourname@college.edu",
     *   "name": "Your Name",
     *   "rollNo": "yourrollno",
     *   "accessCode": "your-access-code",
     *   "clientID": "clientid-from-registration",
     *   "clientSecret": "clientsecret-from-registration"
     * }
     */
    @PostMapping("/auth")
    public ResponseEntity<String> authenticate(@RequestBody Map<String, String> body) {
        log.log("backend", "info", "registration-controller",
                "Auth endpoint called for clientID=" + body.get("clientID"));

        String result = registrationService.authenticate(
                body.get("email"),
                body.get("name"),
                body.get("rollNo"),
                body.get("accessCode"),
                body.get("clientID"),
                body.get("clientSecret")
        );
        return ResponseEntity.ok(result);
    }
}
