package com.cognitive.backend_spring.domain.auth.dto;

// 토큰 응답
public record AuthResponse(String accessToken, String email) {}
