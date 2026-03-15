package com.cognitive.backend_spring.domain.auth.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// 회원가입 요청
public record RegisterRequest(
        String email,
        String name,

        @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다.")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]+$",
                message = "비밀번호는 영문과 숫자를 포함해야 합니다.")
        String password,

        String nickname,
        String profileImage
) {}
