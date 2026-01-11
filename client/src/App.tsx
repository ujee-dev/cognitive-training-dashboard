import { BrowserRouter } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

import AppLayout from "./components/layout/AppLayout";

import { AuthProvider } from "./auth/AuthProvider";
import AppRouter from "./routes/AppRouter";
import { AuthInitializer } from './auth/AuthInitializer';
import { useAuthFailureHandler } from './auth/useAuthFailureHandler';
import { useAuth } from './auth/useAuth';
import Spinner from './components/ui/Spinner';

function AuthBootstrap() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return null;
}

function AuthFailureHandler() {
  useAuthFailureHandler();
  return null;
}

// UI 링크와 별도로 모든 페이지는 AppRoute에 등록해야 화면이 보여짐
export default function App() {
  // Auth 초기화는 App의 책임
  // ** 개별 컴포넌트(Header, Route)는 로딩을 알 필요 없음 **

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      
      <AuthProvider> {/* 반드시 Router 안에 배치 */}
        <AuthInitializer /> {/* 상태 변경 */}
        <AuthFailureHandler />

        {/* 전역 Auth 초기화 Spinner */}
        <AuthBootstrap />

        {/* 재사용 가능한 레이아웃 */}
        <AppLayout>
          <AppRouter />
        </AppLayout>

      </AuthProvider>
    </BrowserRouter>
  );
}
