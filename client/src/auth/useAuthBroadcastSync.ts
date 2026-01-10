// auth/useAuthBroadcastSync.ts
import { useEffect } from "react";
import { authBroadcast } from "./authBroadcast";
import { useAuth } from "./useAuth";

export function useAuthBroadcastSync() {
  const { setUser } = useAuth();

  useEffect(() => {
    return authBroadcast.subscribe((msg) => {
      if (msg === "logout") {
        localStorage.removeItem("accessToken");
        setUser(null);
      }

      if (msg === "login") {
        setUser(null); // restoreAuth 트리거
      }
    });
  }, [setUser]);
}
