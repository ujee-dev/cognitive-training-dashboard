// src/auth/authSessionManager.ts
import { authEventBus } from "./authEventBus";
import { sessionState } from "./sessionState";

export const authSessionManager = {
  onRefreshFailed() {
    // 이미 처리되었으면 무시
    if (!sessionState.markRefreshFailed()) return;

    authEventBus.emit("refresh-failed");
  },
};
