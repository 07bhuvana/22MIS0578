package com.affordmed.campus.service;

import com.affordmed.campus.config.ApiConfig;
import com.affordmed.campus.middleware.LoggingMiddleware;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

/**
 * Handles Registration and Authentication with the Affordmed Test Server.
 *
 * Step 1: POST /evaluation-service/register  → get clientID + clientSecret
 * Step 2: POST /evaluation-service/auth       → get Bearer token
 *
 * NOTE: Registration can only be done ONCE. Save your clientID and clientSecret.
 */
@Service
public class RegistrationService {

    private static final Logger logger = LoggerFactory.getLogger(RegistrationService.class);

    @Autowired
    private WebClient webClient;

    @Autowired
    private ApiConfig apiConfig;

    @Autowired
    private LoggingMiddleware log;

    /**
     * Registers with the test server.
     * Fill in your details before calling this.
     *
     * @param email          your university email
     * @param name           your full name
     * @param mobileNo       your mobile number
     * @param githubUsername your GitHub username (only the username, not the URL)
     * @param rollNo         your roll number
     * @param accessCode     the access code shared via email
     * @return registration response as JSON string
     */
    public String register(String email, String name, String mobileNo,
                           String githubUsername, String rollNo, String accessCode) {
        log.log("backend", "info", "registration",
                "Initiating registration for email=" + email + ", rollNo=" + rollNo);

        Map<String, String> body = new HashMap<>();
        body.put("email", email);
        body.put("name", name);
        body.put("mobileNo", mobileNo);
        body.put("githubUsername", githubUsername);
        body.put("rollNo", rollNo);
        body.put("accessCode", accessCode);

        try {
            String response = webClient.post()
                    .uri(apiConfig.getBaseUrl() + "/register")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.log("backend", "info", "registration",
                    "Registration response received: " + response);

            System.out.println("\n========================================");
            System.out.println("REGISTRATION RESPONSE (SAVE THIS!):");
            System.out.println(response);
            System.out.println("========================================\n");

            return response;
        } catch (Exception e) {
            log.log("backend", "error", "registration",
                    "Registration failed: " + e.getMessage());
            return "Registration failed: " + e.getMessage();
        }
    }

    /**
     * Obtains a Bearer token from the auth endpoint.
     * Use the clientID and clientSecret from registration.
     *
     * @param email        your email
     * @param name         your name
     * @param rollNo       your roll number
     * @param accessCode   access code
     * @param clientId     from registration response
     * @param clientSecret from registration response
     * @return bearer token string
     */
    public String authenticate(String email, String name, String rollNo,
                               String accessCode, String clientId, String clientSecret) {
        log.log("backend", "info", "auth",
                "Requesting auth token for clientId=" + clientId);

        Map<String, String> body = new HashMap<>();
        body.put("email", email);
        body.put("name", name);
        body.put("rollNo", rollNo);
        body.put("accessCode", accessCode);
        body.put("clientID", clientId);
        body.put("clientSecret", clientSecret);

        try {
            JsonNode response = webClient.post()
                    .uri(apiConfig.getBaseUrl() + "/auth")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response != null && response.has("access_token")) {
                String token = response.get("access_token").asText();
                log.log("backend", "info", "auth",
                        "Auth token obtained successfully. Update api.auth-token in application.properties.");
                System.out.println("\n========================================");
                System.out.println("YOUR BEARER TOKEN (copy to application.properties):");
                System.out.println(token);
                System.out.println("========================================\n");
                return token;
            } else {
                log.log("backend", "warn", "auth",
                        "Auth response did not contain access_token: " + response);
                return response != null ? response.toString() : "null response";
            }
        } catch (Exception e) {
            log.log("backend", "error", "auth",
                    "Authentication failed: " + e.getMessage());
            return "Authentication failed: " + e.getMessage();
        }
    }
}
