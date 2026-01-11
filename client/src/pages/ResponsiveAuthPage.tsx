import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

import { authApi } from '../api/api';
import { useAuth } from '../auth/useAuth';
import { useAuthActions } from "../auth/useAuthActions";
import { authRedirect } from "../auth/authRedirect";

import AuthLayoutWithSidebar from "../components/layout/AuthLayoutWithSidebar";
import { Button } from "../components/ui/Button";

export function ResponsiveAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { user } = useAuth(); // 읽기 전용
  const { login } = useAuthActions(); // 행동

  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/";

  // [튕겨내기 로직] 이미 로그인했다면 홈으로 전송
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true }); // 이곳은 UX가 아님, 안정성 로직
    }
  }, [user, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
    
    try {
      const data = await authApi.login({ email, password });

      if (!data.accessToken) {
        throw new Error("로그인 응답에 토큰이 없습니다.");
      }
      
      // accessToken을 반드시 전달
      login(data.accessToken);

      authRedirect.afterLogin(navigate, location);
    } catch (err: unknown) {
      // interceptor / refresh / authEventBus와 **절대 섞이면 안 됨**
      // "handleApiError 사용하지 않음"
      if (axios.isAxiosError(err)) {
        const serverMessage = err.response?.data?.message;
        const msg = Array.isArray(serverMessage)
          ? serverMessage.join(" / ")
          : serverMessage || "로그인에 실패했습니다.";

        toast.error(msg);
      } else {
        toast.error("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  // 로그인 상태일 때는 화면을 잠시 숨김
  if (user) return null;
  const inputStyle = "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <AuthLayoutWithSidebar>
      <h1 className="text-2xl font-bold mb-6 text-center">로그인</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">이메일</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={inputStyle}
            placeholder="example@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={inputStyle}
            placeholder="••••••••"
            required
          />
        </div>

        <Button type="submit" className="w-full mt-4" variant="primary">
          로그인
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        아직 계정이 없으신가요?{" "}
        <NavLink
          to="/signup"
          className="ml-3 text-blue-500 hover:underline">
          회원가입
        </NavLink>
        {" | "}
        <NavLink to="/"
          className="text-gray-500 hover:underline">
          홈으로
        </NavLink>
      </p>
    </AuthLayoutWithSidebar>
  );
};
