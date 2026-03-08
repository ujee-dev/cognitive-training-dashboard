import { Outlet } from "react-router-dom";
import { useAuthFailureHandler } from "../../auth/useAuthFailureHandler";
import Header from "./Header";

export default function AppLayout() {
  useAuthFailureHandler();
  
  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* 상단 헤더 */}
      <Header />

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 pt-20 px-4">
        <div className="max-w-4xl mx-auto w-full">
          {/* 라우터가 자식 컴포넌트들을 렌더링하는 지점입니다. 
             기존의 {children}을 <Outlet />으로 바꾸면 오류가 해결됩니다.
          */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
