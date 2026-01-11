import type { ReactNode } from "react";
import Header from "./Header";

// 페이지 레이아웃 컴포넌트
interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* 상단 헤더 */}
      <Header />

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 pt-20 px-4">
        <div className="max-w-4xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
