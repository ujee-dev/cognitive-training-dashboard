package com.cognitive.backend_spring.global.auth;

import com.cognitive.backend_spring.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Vite 개발 서버(5173)와 빌드 후 미리보기(4173) 모두 허용
        configuration.setAllowedOrigins(List.of(
                "https://localhost:5173",
                "https://localhost:4173"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*")); // 모든 헤더 허용
        configuration.setAllowCredentials(true); // 쿠키(Refresh Token) 전송을 위해 필수!

        // 브라우저가 응답에서 읽을 수 있는 헤더 (필요시 추가)
        configuration.setExposedHeaders(List.of("Authorization", "Set-Cookie"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Guard가 없는 완전 허용 경로
                .requestMatchers("/auth/signup", "/auth/login").permitAll()
                .requestMatchers("/records/games/**", "/records/gameConfig").permitAll()
                .requestMatchers("/uploads/profiles/**").permitAll() // 이미지 경로 허용

                // 인증이 필요한 경로 (NestJS @UseGuards 대응)
                .requestMatchers("/auth/me", "/auth/logout", "/auth/refresh").authenticated()
                .requestMatchers("/records", "/records/dashboard", "/records/stats/**").authenticated()
                .requestMatchers("/users/**").authenticated() // UsersController 전체 Guard 대응

                .requestMatchers("/error").permitAll() // 검증 에러 발생 시 리다이렉트되는 경로 허용

                .anyRequest().authenticated()
            )
            .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider, userRepository),
                    UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // 비밀번호 암호화 도구
    }
}
