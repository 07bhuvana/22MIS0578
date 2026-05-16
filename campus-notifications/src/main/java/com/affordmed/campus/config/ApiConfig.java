package com.affordmed.campus.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Data
@Component
public class ApiConfig {

    @Value("${api.base-url}")
    private String baseUrl;

    @Value("${api.client-id}")
    private String clientId;

    @Value("${api.client-secret}")
    private String clientSecret;

    @Value("${api.access-code}")
    private String accessCode;

    @Value("${api.auth-token}")
    private String authToken;

    @Value("${notification.top-n:10}")
    private int topN;
}