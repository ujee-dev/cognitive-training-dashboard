import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";

import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../auth/ProtectedRoute";

// 기존 import 페이지를 lazy 불러오기로 변경
const Home = lazy(() => import('../pages/Home'));
const Game = lazy(() => import('../pages/Game'));
const Result = lazy(() => import('../pages/Result'));
const Performance = lazy(() => import('../pages/Performance'));
const ResponsiveAuthPage = lazy(() => import('../pages/ResponsiveAuthPage'));
const SignupPage = lazy(() => import('../pages/SignupPage'));
const Profile = lazy(() => import('../pages/Profile'));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />, // 공통 레이아웃
    children: [
      { index: true, element: <Home /> },
      { path: "/game", element: <Game /> },
      { path: "/result", element: <Result /> },
      { path: "/login", element: <ResponsiveAuthPage /> },
      { path: "/signup", element: <SignupPage /> },

      // 인증이 필요한 라우트 묶기
      {
        element: <ProtectedRoute />,
        children: [
          { path: "performance", element: <Performance /> },
          { path: "profile", element: <Profile /> },
        ],
      },
    ],
  },
]);
