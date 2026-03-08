import { RouterProvider } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./auth/AuthProvider";
import { router } from "./routes/AppRouter";
import { AuthInitializer } from './auth/AuthInitializer';

import { GameProvider } from './components/game/GameProvider';

// UI 링크와 별도로 모든 페이지는 AppRoute에 등록해야 화면이 보여짐
export default function App() {
  return (
    <AuthProvider> {/* 반드시 Router 안에 배치 */}
      <GameProvider>
        <Toaster position="top-center" />

        <AuthInitializer />

        {/* RouterProvider가 기존의 BrowserRouter와 AppRouter 역할을 모두 대신함 */}
        <RouterProvider router={router} />

      </GameProvider>
    </AuthProvider>
  );
}
