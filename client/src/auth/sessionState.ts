/**
 * 전역 세션 상태 (네트워크 레벨)
 * React state ❌
 */
let isLoggingOut = false;
let hasRefreshFailed = false;

export const sessionState = {
  startLogout() {
    isLoggingOut = true;
  },

  endLogout() {
    isLoggingOut = false;
    hasRefreshFailed = false;
  },

  markRefreshFailed() {
    if (hasRefreshFailed) return false;
    hasRefreshFailed = true;
    return true;
  },

  get isLoggingOut() {
    return isLoggingOut;
  },
};
