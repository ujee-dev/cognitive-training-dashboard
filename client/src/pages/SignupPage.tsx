import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { authApi } from "../api/api";
import { showSuccess } from "../ui/toast"; // 성공 toast만 사용
import { handleApiError } from "../api/handleApiError";

import AuthLayoutWithSidebar from "../components/layout/AuthLayoutWithSidebar";
import { Button } from "../components/ui/Button";

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
  const inputStyle = "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <AuthLayoutWithSidebar>
      {/* 상단 제목 */}
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-surface-900">회원가입</h1>
        <p className="text-surface-500 font-medium">새로운 계정을 생성하세요.</p>
      </div>

      {/* 회원가입 폼 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 이름/닉네임 50:50 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium mb-2">이름</label>
            <input
              type="text"
              name="name"
              className={inputStyle}
              onChange={handleChange}
              required
              placeholder="홍길동"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-2">닉네임</label>
            <input
              type="text"
              name="nickname"
              className={inputStyle}
              onChange={handleChange}
              required
              placeholder="닉네임"
            />
          </div>
        </div>

        {/* 이메일 */}
        <div>
          <label className="block text-sm font-medium mb-2">이메일 (ID)</label>
          <input
            type="email"
            name="email"
            className={inputStyle}
            onChange={handleChange}
            required
            placeholder="example@mail.com"
          />
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="block text-sm font-medium mb-2">비밀번호</label>
          <input
            type="password"
            name="password"
            className={inputStyle}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />
        </div>

        {/* 제출 버튼 */}
        <Button
          type="submit"
          className="w-full py-3 mt-4"
          variant="primary"
        >
          가입하기
        </Button>
      </form>

      {/* 로그인 링크 */}
      <p className="mt-6 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{" "}
        <NavLink
          to="/login"
          className="ml-3 text-blue-500 hover:underline"
        >
          로그인하기
        </NavLink>
        {" | "}
        <NavLink to="/"
          className="text-gray-500 hover:underline">
          홈으로
        </NavLink>
      </p>
    </AuthLayoutWithSidebar>
  );

}
