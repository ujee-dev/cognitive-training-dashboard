import { Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import { Game } from "../pages/Game";
import { Result } from "../pages/Result";
import { Performance } from "../pages/Performance";
import { ResponsiveAuthPage } from "../pages/ResponsiveAuthPage";
import ProtectedRoute from "../auth/ProtectedRoute";
import { SignupPage } from "../pages/SignupPage";
import { Profile } from "../pages/Profile";

const AppRouter = () => {
  return (
    <Routes>
      {/* 공개 라우트 */}
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<Game />} />
      <Route path="/result" element={<Result />} />
      <Route path="/login" element={<ResponsiveAuthPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* 보호된 라우트 */}
      <Route element={<ProtectedRoute />}>
        <Route path="/performance" element={<Performance />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
