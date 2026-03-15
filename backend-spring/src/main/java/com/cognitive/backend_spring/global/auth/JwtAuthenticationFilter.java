package com.cognitive.backend_spring.global.auth;

import com.cognitive.backend_spring.domain.user.User;
import com.cognitive.backend_spring.domain.user.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository; // DB 조회를 위해 주입

    // 이 필터를 거치지 않을 경로 설정
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();

        // NestJS에서 UseGuards가 없는 경로들만 true(필터 건너뜀)로 설정
        return path.equals("/auth/signup") ||
                path.equals("/auth/login") ||
                path.equals("/auth/refresh") ||
                path.startsWith("/records/games/") || // @Get('games/:code')
                path.equals("/records/gameConfig");   // @Get('gameConfig')
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 헤더에서 토큰 추출
        String token = resolveToken(request);

        // 토큰 유효성 검사
        if (token != null && jwtTokenProvider.validateToken(token)) {
            // 토큰에서 이메일 추출
            String email = jwtTokenProvider.getEmail(token);

            // DB에서 유저 조회
            User user = userRepository.findByEmail(email).orElse(null);

            if (user != null) {
                // UserPrincipal 생성 (컨트롤러의 @AuthenticationPrincipal과 타입을 맞춤)
                UserPrincipal userPrincipal = new UserPrincipal(user);

                // 인증 객체 생성 (principal 자리에 userPrincipal 주입)
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
