// src/auth/AuthProvider.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { authApi } from '../api/api';
import type { UserInfo } from "./types";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);

  /**
   * 앱 최초 로딩 시 인증 복구
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const me = await authApi.getMe();
        console.log('getMe');
        setUser(me);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem("accessToken");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 멀티 탭 로그아웃 동기화 (선택)
  useEffect(() => {
    const handleStorageChange = async (e: StorageEvent) => {
      // 로컬스토리지의 accessToken이 변경되었을 때 실행
      if (e.key === "accessToken") {
        if (!e.newValue) {
          // 토큰이 삭제되었다면 (다른 창에서 로그아웃)
          setUser(null);
          setIsAuthenticated(false);
        } else {
          // 다른 탭에서 로그인 시
          // 토큰만 true로 바꿀 게 아니라,
          // 서버에서 유저 정보를 가져와야 헤더에 이름이 뜹니다.
          setIsAuthenticated(true);
          try {
            const me = await authApi.getMe(); // 유저 정보 호출
            setUser(me);
          } catch {
            console.error("유저 정보 복구 실패");
          }
        }
      }
    };

    // 다른 창의 로컬스토리지 변화를 감지
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /**
   * 로그인 성공 처리
  */
  const login = useCallback(async (accessToken: string) => {
    localStorage.setItem("accessToken", accessToken);

    const me = await authApi.getMe();

    setUser(me);
    setIsAuthenticated(true);

    navigate("/", { replace: true });
  }, [navigate]);


  /**
   * 로그아웃 (서버 실패와 무관하게 클라이언트 정리)
   * axios → 세션 만료 시 강제 리다이렉트
   * AuthProvider → 사용자가 눌렀을 때의 명시적 로그아웃
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logoutApi();
    } catch {
      // 무시
      console.warn('서버 로그아웃 실패 → 클라이언트 정리 진행');
    } finally {
      setUser(null);

      localStorage.removeItem("accessToken");
      setIsAuthenticated(false);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const value = useMemo(() => ({
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
  }), [isAuthenticated, isLoading, user, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
