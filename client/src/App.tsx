import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from "./contexts/AuthProvider";
import AppRouter from "./routes/AppRouter";
import Header from './components/layout/Header';

// UI 링크와 별도로 모든 페이지는 AppRoute에 등록해야 화면이 보여짐
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider> {/* 반드시 Router 안에 배치 */}
        {/* 최상위 컨테이너 */}
        <div className="min-h-screen w-full flex flex-col bg-gray-50">
          {/* 헤더 */}
          <Header />
          {/* 메인 콘텐츠 세로 메뉴형 필요 없어서 참고용으로 남김 : <main className="flex-1 pt-36 md:pt-20 px-4"> */}
          <main className="flex-1 pt-20 px-4">
            {/* 중앙 정렬 + 폭 제한 */}
            <div className="max-w-4xl mx-auto w-full">
              <AppRouter />
            </div>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
