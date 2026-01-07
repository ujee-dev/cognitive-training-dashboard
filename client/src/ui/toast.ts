// ui/toast.ts : 컴포넌트가 아니라 "UI를 호출하는 도구" = 순수 함수
import { toast } from "react-hot-toast";

let hasShown = false;

/**
 * 세션 만료 (401 refresh 실패) - axios interceptor 전용
 */
export const showSessionExpired = () => {
  // refresh 실패가 **여러 요청에서 동시에 발생** 가능 = toast 중복 방지 (1 번만 노출)
  if (hasShown) return;

  hasShown = true;

  toast.error("세션이 만료되었습니다. 다시 로그인해 주세요.");

  // UX 안정화용 reset (페이지 이동 후 다시 사용 가능)
  setTimeout(() => {
    hasShown = false;
  }, 3000);
};

/**
 * 공통 성공 메시지 - 페이지/컴포넌트에서 직접 호출
 */
export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showUnauthorized = () => {
  toast.error("로그인이 필요합니다.");
};

export const showError = (message?: string | string[]) => {
  if (!message) {
    toast.error("요청 처리 중 오류가 발생했습니다.");
    return;
  }
  
  if (Array.isArray(message)) {
    toast.error(message[0]);
  } else {
    toast.error(message);
  }
};

/**
 * 권한 없음 (403)
 */
export const showForbidden = () => {
  toast.error("접근 권한이 없습니다.");
};

/**
 * 서버 오류 (5xx)
 */
export const showServerError = () => {
  toast.error("서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
};

/**
 * 충돌 (409)
 */
export const showConflict = (message?: string) => {
  toast.error(message ?? "이미 존재하는 정보입니다.");
};
