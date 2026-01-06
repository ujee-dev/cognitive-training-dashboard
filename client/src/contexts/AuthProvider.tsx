import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // 위에서 만든 파일 가져오기
import { logoutApi, getMe } from '../api/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  // 안전한 설정
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // 무조건 false로 시작
  const [isLoading, setIsLoading] = useState<boolean>(true); // 검사 중임을 표시

  useEffect(() => {
    const initAuth = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) { 
        setIsLoading(false); 
        return; 
        }

        try {
        await getMe(); // 여기서 가짜 Value면 catch로 튕겨나감
        setIsAuthenticated(true); // 진짜일 때만 true로 변경
        } catch {
        localStorage.removeItem("accessToken");
        setIsAuthenticated(false);
        } finally {
        setIsLoading(false); // 검사가 다 끝나야 화면을 보여줌
        }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
        // 로컬스토리지의 accessToken이 변경되었을 때 실행
        if (e.key === 'accessToken') {
        if (!e.newValue) {
            // 토큰이 삭제되었다면 (다른 창에서 로그아웃)
            setIsAuthenticated(false);
        } else {
            // 토큰이 생겼다면 (다른 창에서 로그인)
            setIsAuthenticated(true);
        }
        }
    };

    // 다른 창의 로컬스토리지 변화를 감지
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = useCallback((accessToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    setIsAuthenticated(true);
    navigate('/', { replace: true });
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
        await logoutApi();
    } catch (err) {
        // 서버 실패와 무관하게 클라이언트는 항상 로그아웃 = 안전
        console.warn("서버 로그아웃 실패, 클라이언트 로그아웃 진행", err);
    } finally {
        // 서버 성공 여부와 관계없이 클라이언트는 확실히 정리
        localStorage.removeItem("accessToken");
        setIsAuthenticated(false);
        navigate("/login", { replace: true });
    }
  }, [navigate]);

  // 서버 상태 (Refresh Token 쿠키 삭제)
  //  클라이언트 상태 (accessToken 제거)
  //  전역 상태 (Context 업데이트)
  //  라우팅 처리
  // → 한 번에 처리됨
  // → 이게 바로 Provider의 역할입니다.

  const value = useMemo(() => ({
    isAuthenticated,
    isLoading,
    login,
    logout
  }), [isAuthenticated, isLoading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
