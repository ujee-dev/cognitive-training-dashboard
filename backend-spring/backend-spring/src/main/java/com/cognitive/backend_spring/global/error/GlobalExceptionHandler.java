package com.cognitive.backend_spring.global.error;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 400 Bad Request: 입력값 오류, 비즈니스 로직 위반 등
    // 서비스에서 throw new IllegalArgumentException("동적 메시지")를 던지면 실행됩니다.
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleBadRequest(IllegalArgumentException e) {
        return buildResponse(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    // 401 Unauthorized: 인증 실패 (로그인 실패, 토큰 만료 등)
    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<?> handleUnauthorized(Exception e) {
        // 보안상 이유는 구체적이지 않게 보낼 수도 있지만, 필요시 e.getMessage() 사용 가능
        return buildResponse(HttpStatus.UNAUTHORIZED, e.getMessage());
    }

    // 404 Not Found: 리소스를 찾을 수 없음
    @ExceptionHandler(jakarta.persistence.EntityNotFoundException.class)
    public ResponseEntity<?> handleNotFound(jakarta.persistence.EntityNotFoundException e) {
        return buildResponse(HttpStatus.NOT_FOUND, e.getMessage());
    }

    // 409 Conflict: 중복 데이터 (이메일 중복 등)
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<?> handleConflict(IllegalStateException e) {
        return buildResponse(HttpStatus.CONFLICT, e.getMessage());
    }

    // 공통 응답 포맷 (NestJS 형식 유지)
    private ResponseEntity<?> buildResponse(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of(
            "statusCode", status.value(),
            "message", message != null ? message : "알 수 없는 오류가 발생했습니다."
        ));
    }

    // @Valid 검증 오류 처리 (이게 없어서 기본 에러 메시지가 나갔던 것임)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException e) {
        // NestJS처럼 모든 에러 메시지를 리스트로 담거나, 첫 번째 것만 보낼 수 있습니다.
        String firstErrorMessage = e.getBindingResult()
                .getAllErrors()
                .get(0)
                .getDefaultMessage();

        return buildResponse(HttpStatus.BAD_REQUEST, firstErrorMessage);
    }
}
