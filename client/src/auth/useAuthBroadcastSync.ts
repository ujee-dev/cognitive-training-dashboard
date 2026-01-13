import { useEffect } from "react";
import { authBroadcast } from "./authBroadcast";
import { useAuth } from "./useAuth";
import { authApi } from "../api/api";
import { authEventBus } from "./authEventBus";

export function useAuthBroadcastSync() {
  const { setUser } = useAuth();

  useEffect(() => {
    // 1. BroadcastChannel 구독 (탭 간 직접 통신)
    const unsubscribe = authBroadcast.subscribe(async (msg) => {
      if (msg.type === "login") {
        try {
          const me = await authApi.getMe();
          setUser(me);
        } catch { setUser(null); }
      }

      if (msg.type === "logout") {
        setUser(null);
        // 필요 시 여기서도 세션 만료 이벤트를 보낼 수 있음
      }

      if (msg.type === "profile-updated") {
        // 프로필 수정 즉시 반영 (API 재호출 없음)
        setUser(msg.payload);
      }
    });

    // Storage 이벤트 감지 (토큰 삭제/세션만료 대응)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "accessToken" && !e.newValue) {
        setUser(null);

        // 사용자가 직접 로그아웃 버튼을 누른 게 아니라면 (플래그 확인)
        const isManualLogout = localStorage.getItem("logout-event");
        if (!isManualLogout) {
          // 세션 만료 알림 트리거
          authEventBus.emit("refresh-failed");
        }
        localStorage.removeItem("logout-event");
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, [setUser]);
}
