import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayoutWithSidebar({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-80px)]  flex items-center justify-center px-4">
      {/* 전체 카드: 하나의 둥근 사각형 */}
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* 왼쪽 사이드 패널 */}
        <div className="hidden lg:flex lg:flex-1 flex-col bg-brand text-white p-12 justify-between">
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

        {/* 오른쪽 폼 영역 */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
