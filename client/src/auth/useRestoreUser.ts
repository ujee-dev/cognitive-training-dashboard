import { useEffect } from "react";
import { authApi } from "../api/api";
import { useAuth } from "./useAuth";
import { authBroadcast } from "./authBroadcast";

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

  // 멀티탭 동기화 – BroadcastChannel
  useEffect(() => {
    return authBroadcast.subscribe((message) => {
      if (message.type === "logout") {
        localStorage.removeItem("accessToken");
        setUser(null);
      }

      if (message.type === "login") {
        // token은 이미 저장됨 → getMe 트리거
        setUser(null);
      }
    });
  }, [setUser]);
}
