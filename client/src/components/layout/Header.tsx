import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; // 커스텀 훅 가져오기

const Header: React.FC = () => {
  // 전역 상태에서 인증 여부와 로그아웃 함수 가져오기
  const { isAuthenticated, logout } = useAuth();

  const activeStyle = "text-yellow-400 visited:text-yellow-400 font-bold";
  const inactiveStyle = "text-white hover:text-yellow-400 visited:text-white";

  return (
    <header className="bg-gray-800 p-4 fixed top-0 left-0 w-full z-10 shadow-md">
      <nav className="max-w-4xl mx-auto">
        <ul className="flex flex-row items-center space-x-4">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
            >
              CogniDash
            </NavLink>
          </li>
          
          <span className="text-gray-500">|</span>

          <li>
            <NavLink
              to="/game"
              className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
            >
              게임
            </NavLink>
          </li>

          {/* 1. 로그인했을 때만 '성과' 메뉴 노출 */}
          {isAuthenticated && (
            <>
              <span className="text-gray-500">|</span>
              <li>
                <NavLink
                  to="/performance"
                  className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
                >
                  성과
                </NavLink>
              </li>
            </>
          )}

          <span className="text-gray-500">|</span>

          {/* 2. 로그인 상태에 따라 '로그인' 또는 '로그아웃' 버튼 표시 */}
          <li>
            {!isAuthenticated ? (
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
              >
                로그인
              </NavLink>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-sm">내 정보</span>
                <button
                  onClick={logout}
                  className="text-white hover:bg-blue-400 text-sm font-medium focus:outline-none transition-colors bg-yellow-400"
                >
                  로그아웃
                </button>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
