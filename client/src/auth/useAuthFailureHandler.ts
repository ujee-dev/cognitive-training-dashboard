import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { authEventBus } from "./authEventBus";
import { useAuthActions } from "./useAuthActions";
import { authRedirect } from "./authRedirect";
import { showSessionExpired } from "../ui/toast";

export function useAuthFailureHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  const { logout } = useAuthActions();

  useEffect(() => {
    return authEventBus.subscribe(() => {
      /** 여기서만 toast logout redirect 실행*/
      showSessionExpired();

      logout(); // 내부에서 상태 + token 정리
      
      authRedirect.toLogin(navigate, { from: location, replace: true }); // 이동
    });
  }, [logout, navigate, location]);
}
