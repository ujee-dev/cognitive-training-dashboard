// components/auth/ProtectedRoutex.ts
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  // 미인증 → 로그인 페이지 + 원래 경로 전달
  if (!user) {
    // 현재 가려던 주소를 state에 담아 로그인 페이지로 리다이렉트
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 인증 완료 → 하위 라우트 렌더링
  return <Outlet />;
};
