package com.cognitive.backend_spring.domain.auth.dto;

import lombok.Builder;

@Builder
public record TokenDto(
        String accessToken,
        String refreshToken
) {}
