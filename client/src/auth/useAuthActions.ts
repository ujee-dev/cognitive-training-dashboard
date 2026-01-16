import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { authApi } from "../api/api";
import { useAuth } from "./useAuth";
import { sessionState } from "./sessionState";
import { authRedirect } from "./authRedirect";
import { authBroadcast } from "./authBroadcast";

// Provider는 React 구조, Actions는 앱 로직
export function useAuthActions() {
  const { setUser, setIsLoading } = useAuth(); // Provider에서 노출 필요
  const navigate = useNavigate(); // login과 logout 전용

  /**
   * 로그인
   */
  const login = useCallback(
    async (accessToken: string) => {
      localStorage.setItem("accessToken", accessToken);
      authBroadcast.send({type: "login"});

      const me = await authApi.getMe();
      setUser(me);
      // 이동은 호출한 쪽(ResponsiveAuthPage)에서..
      // 그래야 login action을 다른 UX(소셜,관리자,자동)에서 재사용 가능
    },
    [setUser]
  );

  /**
   * 명시적 로그아웃 (사용자 액션: 서버 실패와 무관하게 클라이언트 정리)
   * 사용자가 눌렀을 때의 명시적 로그아웃 (홈 /)
   * (참고) axios → 세션 만료 시 강제 리다이렉트 (/login)
   */
  const logout = useCallback(async () => {
    sessionState.startLogout(); // 가장 먼저

    try {
      // 로그아웃 시점에 플래그 설정
      localStorage.setItem("logout-event", Date.now().toString());
      await authApi.logoutApi();
    } catch {
      // 기능적으로는 무시
      // console.warn("서버 로그아웃 실패 → 클라이언트 정리");
    } finally {
      localStorage.removeItem("accessToken");
      authBroadcast.send({type: "logout"}); // 의도 전달만, 실제 정리는 각 탭에서 스스로
      setUser(null);
      localStorage.removeItem("logout-event");
      sessionState.endLogout(); // 정리 완료
      authRedirect.afterLogout(navigate);
    }
  }, [navigate, setUser]);

  /**
   * 앱 최초 인증 복구: navigate X
   */
  const restoreAuth = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const me = await authApi.getMe();
      setUser(me);
    } catch {
      localStorage.removeItem("accessToken");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setIsLoading]);

  return { login, logout, restoreAuth };
}
