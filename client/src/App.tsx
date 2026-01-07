import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from "./auth/AuthProvider";
import AppRouter from "./routes/AppRouter";
import Header from './components/layout/Header';
import { Toaster } from "react-hot-toast";

// UI 링크와 별도로 모든 페이지는 AppRoute에 등록해야 화면이 보여짐
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider> {/* 반드시 Router 안에 배치 */}
        {/* 최상위 컨테이너 */}
        <div className="min-h-screen w-full flex flex-col bg-gray-50">
          {/* 헤더 */}
          <Header />
          <Toaster position="top-center" />
          <main className="flex-1 pt-20 px-4">
            <div className="max-w-4xl mx-auto w-full">
              <AppRouter />
            </div>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
