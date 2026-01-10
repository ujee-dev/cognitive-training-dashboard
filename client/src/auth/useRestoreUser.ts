import { useEffect } from "react";
import { authApi } from "../api/api";
import { useAuth } from "./useAuth";
import { authBroadcast } from "./authBroadcast";
import { authEventBus } from "./authEventBus";

export function useRestoreUser() {
  const { user, setUser, setIsLoading } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    // 토큰 없음 → 비로그인 확정
    if (!token) {
      setIsLoading(false);
      return;
    }

    // 이미 user 있음 → 재호출 금지
    if (user) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const restore = async () => {
      try {
        const me = await authApi.getMe();
        if (!cancelled) setUser(me);
      } catch {
        localStorage.removeItem("accessToken");
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    restore();

    return () => {
      cancelled = true; // 이중 실행 대비
    };
  }, [user, setUser, setIsLoading]);

  // 멀티탭 동기화 – localStorage
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "accessToken") return;

      if (!e.newValue) {
        // 토큰이 삭제됨 (수동 삭제 또는 다른 탭 로그아웃)
        setUser(null);

        // 'logout-event'가 방금 발생했는지 확인
        const isManualLogout = localStorage.getItem("logout-event");
        
        if (isManualLogout) {
          // 사용자가 직접 로그아웃한 경우:
          // toast 없이 로그인 페이지로 이동하거나 초기화 처리 후 플래그 삭제 (선택 사항)
          
        } else {
          // 플래그가 없다면 세션 만료로 간주: 일관성을 위해 toast 발생
          authEventBus.emit("refresh-failed");
        }
        localStorage.removeItem("logout-event");
      } else {
        // 토큰만 생긴 상태 → getMe 재트리거
        setUser(null);
      }
    };

    // 중복 호출 안전 (getMe는 이미 방어됨: 코드 그대로 유지)
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [setUser]);

  // 멀티탭 동기화 – BroadcastChannel
  useEffect(() => {
    return authBroadcast.subscribe((message) => {
      if (message === "logout") {
        localStorage.removeItem("accessToken");
        setUser(null);
      }

      if (message === "login") {
        // token은 이미 저장됨 → getMe 트리거
        setUser(null);
      }
    });
  }, [setUser]);
}
