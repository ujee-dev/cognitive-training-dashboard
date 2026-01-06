import { useState, useEffect } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import { login as loginApi } from '../api/api';
import Spinner from "../components/common/Spinner";
import axios from "axios";

export function ResponsiveAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { isAuthenticated, isLoading , login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/";

  // [튕겨내기 로직] 이미 로그인했다면 홈으로 전송
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
    
    try {
      const data = await loginApi({ email, password });

      if (data.accessToken) {
        // [수정 핵심] localStorage 직접 저장 대신 Context의 login 함수 호출
        // 이 함수 내부에서 localStorage 저장 + 상태 변경 + 이동까지 한 번에 처리합니다.
        login(data.accessToken); 
        console.log("✅ 로그인 성공");
      } else {
        alert("로그인 응답에 토큰이 없습니다.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const serverMessage = err.response?.data?.message;
        const msg = Array.isArray(serverMessage) ? serverMessage.join(' / ') : serverMessage || err.message;
        alert(`❌ 로그인 실패: ${msg}`);
      } else {
        alert(`알 수 없는 에러: ${(err as Error).message}`);
      }
    }
  };

  // 순서 중요: 암기! - 로그인 상태일 때는 화면을 잠시 숨김 (깜빡임 방지)
  if (isLoading) return <Spinner />;
  if (isAuthenticated) return null;

  return (
    // 1. 전체 배경: Flexbox를 이용해 중앙 정렬, 모바일은 상단 정렬 가능
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      
      {/* 2. 카드 컨테이너: 모바일(w-full), 태블릿 이상(max-w-md), 데스크톱(lg:max-w-4xl) */}
      <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row max-w-[400px] lg:max-w-[900px]">
        
        {/* 3. 데스크톱 전용 사이드 패널 (lg 이상에서만 노출) */}
        <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 p-12 text-white flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-indigo-100 leading-relaxed">
              로그인하여 프로젝트의 최신 업데이트를 확인하고 팀원들과 협업하세요.
            </p>
          </div>
          <div className="text-sm opacity-75">© 2026 Your Service Inc.</div>
        </div>

        {/* 4. 로그인/회원가입 폼 섹션 */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">로그인</h1>
            <p className="text-slate-500 mt-2">계정 정보를 입력해주세요.</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">이메일</label>
              <input 
                type="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="example@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">비밀번호</label>
              <input 
                type="password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-md"
            >
              로그인하기
            </button>
          </form>

          {/* 하단 링크 영역 */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              계정이 없으신가요? 
              <a href="/signup" className="ml-2 text-indigo-600 font-semibold hover:underline">회원가입</a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
