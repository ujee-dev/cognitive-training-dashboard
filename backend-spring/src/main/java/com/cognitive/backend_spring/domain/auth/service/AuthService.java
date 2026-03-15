package com.cognitive.backend_spring.domain.auth.service;

import com.cognitive.backend_spring.domain.auth.dto.LoginRequest;
import com.cognitive.backend_spring.domain.auth.dto.RegisterRequest;
import com.cognitive.backend_spring.domain.auth.dto.TokenDto;
import com.cognitive.backend_spring.domain.user.User;
import com.cognitive.backend_spring.domain.user.UserRepository;
import com.cognitive.backend_spring.global.auth.JwtTokenProvider;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // 이건 비밀번호(LoginRequest)용
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public void register(RegisterRequest request) {
        // 이메일 중복 체크 (409 Conflict)
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalStateException("이미 존재하는 이메일입니다.");
        }

        User user = User.builder()
                .email(request.email())
                .name(request.name())
                .password(passwordEncoder.encode(request.password()))
                .nickname(request.nickname())
                .profileImage(request.profileImage())
                .build();

        userRepository.save(user);
    }

    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        // DB의 해시화된 리프레시 토큰을 null로 만들어 무효화합니다.
        user.setCurrentHashedRefreshToken(null);
    }

    @Transactional
    public TokenDto login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("이메일 또는 비밀번호가 잘못되었습니다."));

        // 비밀번호 검증 (BCrypt 유지 - 비밀번호는 보통 짧음)
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("이메일 또는 비밀번호가 잘못되었습니다.");
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getEmail());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getEmail());

        // Refresh Token 해싱 저장 (SHA-256 사용)
        user.setCurrentHashedRefreshToken(hashRefreshToken(refreshToken));

        return TokenDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Transactional
    public TokenDto refreshTokens(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("리프레시 토큰이 유효하지 않거나 만료되었습니다.");
        }

        String email = jwtTokenProvider.getEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 전달받은 토큰을 해싱하여 DB의 해시값과 비교
        String hashedInputToken = hashRefreshToken(refreshToken);
        if (!hashedInputToken.equals(user.getCurrentHashedRefreshToken())) {
            throw new RuntimeException("토큰 정보가 일치하지 않습니다.");
        }

        String newAccess = jwtTokenProvider.createAccessToken(user.getEmail());
        String newRefresh = jwtTokenProvider.createRefreshToken(user.getEmail());

        // 새로운 토큰 갱신 (SHA-256 사용)
        user.setCurrentHashedRefreshToken(hashRefreshToken(newRefresh));

        return TokenDto.builder()
                .accessToken(newAccess)
                .refreshToken(newRefresh)
                .build();
    }

    // BCrypt 대신 SHA-256을 사용하여 토큰을 해싱하는 별도의 메서드: 입력 길이에 제한이 없으며 결과값이 항상 고정 길이(256비트)로 출력
    private String hashRefreshToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("토큰 해싱 중 오류가 발생했습니다.", e);
        }
    }
}
