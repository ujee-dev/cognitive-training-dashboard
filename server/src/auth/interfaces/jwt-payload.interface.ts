// DB 엔티티 아님
// req.user 아님
// 컨트롤러에서 직접 쓰지 않음
export interface JwtPayload {
  sub: string; // 사용자 ID (MongoDB의 경우 24자리의 16진수 문자열로 number 처리시 유실 가능성 있음)
  email: string; // 식별 가능한 이메일
}

// 사람이 읽기 좋은 형태
// sub 같은 JWT 용어 제거
// 비즈니스 로직에서 사용
// Passport validate가 반환하고,
// 컨트롤러의 req.user에 붙을 실제 객체 타입
export interface ValidatedUser {
  userId: string; // sub를 userId로 매핑해서 사용하면 가독성이 좋습니다.
  email: string;
}

// AccessToken에는 없음
// Refresh 전략에서만 필요
// 리프레시 토큰 검증 시 사용할 타입
export interface ValidatedRefreshUser extends ValidatedUser {
  refreshToken: string;
}
