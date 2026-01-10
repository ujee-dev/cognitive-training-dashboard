import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

import { authApi } from '../api/api';
import { useAuth } from '../auth/useAuth';
import { useAuthActions } from "../auth/useAuthActions";
import { authRedirect } from "../auth/authRedirect";

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

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center items-center p-4">
      <div className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row max-w-[400px] lg:max-w-[900px]">
        
        {/* 사이드 패널 (공통 테마 적용) */}
        <div className="hidden lg:flex lg:w-1/2 bg-brand p-12 text-white flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-4">Welcome CodniDash!</h2>
            <p className="text-white/80 leading-relaxed font-medium">
              로그인하여 인지향상 변화를 확인하세요.
            </p>
          </div>
          <div className="text-sm opacity-70 italic font-light">
            © 2026 UJEE. CogniDash Service.
          </div>
        </div>

        {/* 폼 섹션 */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-surface-900">로그인</h1>
            <p className="text-surface-500 mt-2 font-medium">계정 정보를 입력해주세요.</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-surface-900 ml-1">이메일</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-surface-100 focus:ring-2 focus:ring-brand outline-none transition-all bg-surface-50/30"
                placeholder="example@email.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-surface-900 ml-1">비밀번호</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-surface-100 focus:ring-2 focus:ring-brand outline-none transition-all bg-surface-50/30"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand/20 active:scale-[0.98]"
            >
              로그인하기
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-surface-100 text-center">
            <p className="text-sm text-surface-500 font-medium">
              계정이 없으신가요?
              <NavLink to="/signup" className="ml-2 text-brand font-bold hover:underline">
                회원가입
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
