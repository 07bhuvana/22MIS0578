package com.affordmed.campus.middleware;

import com.affordmed.campus.config.ApiConfig;
import com.affordmed.campus.model.LogRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class LoggingMiddleware {

    private static final Logger logger = LoggerFactory.getLogger(LoggingMiddleware.class);

    @Autowired
    private WebClient webClient;

    @Autowired
    private ApiConfig apiConfig;

    @Autowired
    private ObjectMapper objectMapper;

    public void log(String stack, String level, String pkg, String message) {
        // Log locally using SLF4J
        switch (level.toLowerCase()) {
            case "fatal":
            case "error":
                logger.error("[{}][{}] {}", stack, pkg, message);
                break;
            case "warn":
                logger.warn("[{}][{}] {}", stack, pkg, message);
                break;
            case "debug":
                logger.debug("[{}][{}] {}", stack, pkg, message);
                break;
            default:
                logger.info("[{}][{}] {}", stack, pkg, message);
                break;
        }

        // Send log to test server asynchronously
        sendLogToServer(stack, level, pkg, message);
    }

    private void sendLogToServer(String stack, String level, String pkg, String message) {
        try {
            LogRequest logRequest = new LogRequest(stack, level, pkg, message);

            webClient.post()
                    // This will now correctly pull http://20.244.56.144/evaluation-service from the YAML
                    .uri(apiConfig.getBaseUrl() + "/logs")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiConfig.getAuthToken())
                    .bodyValue(logRequest)
                    .retrieve()
                    .bodyToMono(String.class)
                    .subscribe(
                            response -> logger.debug("Log sent to server successfully: {}", response),
                            error -> logger.error("Failed to send log to server: {}", error.getMessage())
                    );
        } catch (Exception e) {
            logger.error("Exception while sending log to server: {}", e.getMessage());
        }
    }
}