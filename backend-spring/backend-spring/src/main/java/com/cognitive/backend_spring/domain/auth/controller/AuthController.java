package com.cognitive.backend_spring.domain.auth.controller;

import com.cognitive.backend_spring.domain.auth.dto.LoginRequest;
import com.cognitive.backend_spring.domain.auth.dto.RegisterRequest;
import com.cognitive.backend_spring.domain.auth.dto.TokenDto;
import com.cognitive.backend_spring.domain.auth.service.AuthService;
import com.cognitive.backend_spring.domain.user.User;
import com.cognitive.backend_spring.domain.user.UserRepository;
import com.cognitive.backend_spring.domain.user.dto.UserResponseDto;
import com.cognitive.backend_spring.global.auth.UserPrincipal;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        // 이미 Principal이 UserPrincipal 타입이므로 바로 email 추출
        String email = principal.getUsername();

        // DB에서 실제 User 엔티티 조회
        User user = userRepository.findByEmail(email)
                .orElse(null); // 에러를 던지기보다 null 체크 후 처리

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "사용자를 찾을 수 없습니다."));
        }

        // 클라이언트에게 줄 때는 DTO를 통해 'name' 키로 전달
        return ResponseEntity.ok(new UserResponseDto(user));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response) {

        TokenDto tokens = authService.login(request);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", tokens.refreshToken())
                .httpOnly(true)
                .secure(false) // 로컬(http) 환경에서는 반드시 false!!
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(Map.of("accessToken", tokens.accessToken()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(
            @CookieValue(name = "refreshToken") String refreshToken,
            HttpServletResponse response) {

        TokenDto tokens = authService.refreshTokens(refreshToken);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", tokens.refreshToken())
                .httpOnly(true)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(Map.of("accessToken", tokens.accessToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @AuthenticationPrincipal UserPrincipal principal, // Object 대신 UserPrincipal 사용
            HttpServletResponse response
    ) {
        // DB 토큰 삭제 로직 호출 (NestJS의 removeRefreshToken 대응)
        if (principal != null) {
            // principal.getUsername()은 email을 반환하도록 설정했으므로 그대로 사용
            authService.logout(principal.getUsername());
        }

        // 쿠키 삭제 (NestJS의 res.clearCookie와 동일)
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false) // 배포 시 true로 변경 권장 (로컬에서는 false)
                .path("/")
                .maxAge(0) // 즉시 만료시켜 브라우저에서 제거
                .sameSite("Lax") // CSRF 방지 및 크로스 도메인 설정에 따라 조절
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok().body(Map.of("message", "로그아웃 완료"));
    }
}
