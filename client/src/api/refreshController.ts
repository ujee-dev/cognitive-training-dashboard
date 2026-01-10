/**
 * refresh "동시성 제어"
 * interceptor는 여기만 신뢰
 */
import { sessionState } from "../auth/sessionState";

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export function startRefresh(
  refreshFn: () => Promise<string>
): Promise<string> {
  // 로그아웃 중이면 refresh 자체를 거부
  if (sessionState.isLoggingOut) {
    return Promise.reject(new Error("Logout in progress"));
  }

  if (!isRefreshing) {
    isRefreshing = true;
    
    refreshPromise = refreshFn()
      .then((newToken) => newToken)
      .finally(() => {
        isRefreshing = false;
      });
  }

  return refreshPromise!;
}

export function clearRefresh() {
  isRefreshing = false;
  refreshPromise = null;
}
