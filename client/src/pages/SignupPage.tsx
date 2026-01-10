import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { authApi } from "../api/api";
import { showSuccess } from "../ui/toast"; // 성공 toast만 사용
import { handleApiError } from "../api/handleApiError";

export function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    nickname: "",
    profileImage: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await authApi.signup(formData);

      // 성공 UX만 여기서 처리
      showSuccess("회원가입이 완료되었습니다. 로그인해 주세요.");
      navigate("/login"); // 인증 흐름이 아니므로 지금은 현재 코드 유지
    } catch (error) {
      handleApiError(error);
    }
  };

  // 공용 스타일 추출 (유지보수 용이)
  const inputStyle = "w-full px-4 py-3 rounded-xl border border-surface-100 focus:ring-2 focus:ring-brand outline-none transition-all text-surface-900 bg-surface-50/30";
  const labelStyle = "block text-sm font-bold text-surface-900 mb-1.5 ml-1";

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center items-center p-4">
      <div className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row max-w-[400px] lg:max-w-[900px]">
        
        {/* 왼쪽 패널 (로그인과 통일) */}
        <div className="hidden lg:flex lg:w-1/2 bg-brand p-12 text-white flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-4">Start CogniDash!</h2>
            <p className="text-white/80 leading-relaxed font-medium">
              지금 가입하여 당신만을 위한<br/> 맞춤형 인지 훈련 프로그램에 참여하세요.
            </p>
          </div>
          <div className="text-sm opacity-70 italic font-light">
            © 2026 UJEE. CogniDash Service.
          </div>
        </div>

        {/* 폼 섹션 */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-surface-900">회원가입</h1>
            <p className="text-surface-500 mt-2 font-medium">새로운 계정을 생성하세요.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>이름</label>
                <input type="text" name="name" className={inputStyle} onChange={handleChange} required placeholder="홍길동" />
              </div>
              <div>
                <label className={labelStyle}>닉네임</label>
                <input type="text" name="nickname" className={inputStyle} onChange={handleChange} required placeholder="닉네임" />
              </div>
            </div>

            <div>
              <label className={labelStyle}>이메일 (ID)</label>
              <input type="email" name="email" className={inputStyle} onChange={handleChange} required placeholder="example@mail.com" />
            </div>

            <div>
              <label className={labelStyle}>비밀번호</label>
              <input type="password" name="password" className={inputStyle} onChange={handleChange} required placeholder="••••••••" />
            </div>

            <button
              type="submit"
              className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-brand/20 transition-all active:scale-[0.98] mt-4"
            >
              가입하기
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-100 text-center">
            <p className="text-sm text-surface-500 font-medium">
              이미 계정이 있으신가요?{" "}
              <NavLink to="/login" className="text-brand font-bold hover:underline ml-1">
                로그인하기
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
