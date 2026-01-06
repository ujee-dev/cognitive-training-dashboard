import { Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import { Game } from "../pages/Game";
import { Result } from "../pages/Result";
import { Performance } from "../pages/Performance";
import { ResponsiveAuthPage } from "../pages/ResponsiveAuthPage";
import ProtectedRoute from "../components/auth/ProtectedRoute";

// import { TestJwt } from './pages/test/TestJwt';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<Game />} />
      <Route path="/result" element={<Result />} />
      <Route path="/login" element={<ResponsiveAuthPage />} />

      {/* 보호된 라우트 */}
      <Route
        path="/performance"
        element={
          <ProtectedRoute>
            <Performance />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRouter;
