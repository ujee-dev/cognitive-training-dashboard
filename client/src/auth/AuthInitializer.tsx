import { useRestoreUser } from "./useRestoreUser";
import { useAuthBroadcastSync } from "./useAuthBroadcastSync";

export function AuthInitializer() {
  useRestoreUser(); // 초기 복구
  useAuthBroadcastSync(); // 멀티탭 동기화
  return null;
}
