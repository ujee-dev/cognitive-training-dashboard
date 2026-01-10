import type { NavigateFunction, Location } from "react-router-dom";

/**
 * 인증 UX 전용 Redirect 규칙
 * - "어디로 보내야 하는가"를 단일 책임으로 관리
 * 판단은 항상 authRedirect
 */
export const authRedirect = {
  // 인증 실패 / 세션 만료
  toLogin(
    navigate: NavigateFunction,
    options?: {
      from?: Location;
      replace?: boolean;
    }
  ) {
    navigate("/login", {
      replace: options?.replace ?? true,
      state: options?.from ? { from: options.from } : undefined,
    });
  },

  // 로그인 성공 후
  afterLogin(navigate: NavigateFunction, location?: Location) {
    const from = location?.state?.from?.pathname;
    navigate(from || "/", { replace: true });
  },

  // 명시적 로그아웃
  afterLogout(navigate: NavigateFunction) {
    navigate("/", { replace: true });
  },
};
