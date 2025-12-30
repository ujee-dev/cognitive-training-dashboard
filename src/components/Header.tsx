import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 p-4 fixed top-0 left-0 w-full z-10">
      <nav>
        <ul className="flex flex-row space-x-4">
        {/*<ul className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">*/}
          {/* 메뉴가 길지 않아서 우선 컬럼형 유지
            기본적으로 flex-col을 사용하여 세로로 쌓입니다.
            태블릿 이상(768px 이상)에서는 md:flex-row로 가로로 나열되며,
            링크들 간의 간격을 md:space-x-4로 설정합니다.
            모바일에서는 space-y-2를 사용하여 세로 간격을 추가
          */}
          {/* 각 페이지로 이동하는 링크 */}
          <li>
          {/* '/'는 모든 경로의 prefix라서 end가 없으면 /game에서도 홈이 활성화됨, 루트 링크에는 반드시 end 권장 */}
            <NavLink to="/" end
              className={({ isActive }) =>
                isActive
                  ? "text-yellow-400 visited:text-yellow-400 font-bold"
                  : "text-white hover:text-yellow-400 visited:text-white"}>
                CogniDash</NavLink>
          </li>
          <span className='text-white'>|</span>
          <li>
            <NavLink to="/game"
              className={({ isActive }) =>
                isActive
                  ? "text-yellow-3oo visited:text-yellow-300 font-semibold"
                  : "text-white hover:text-yellow-200 visited:text-white"}>
                게임
            </NavLink>
          </li>
          <span className='text-white'>|</span>
          <li>
            <NavLink to="/performance"
              className={({ isActive }) =>
                isActive
                  ? "text-yellow-3oo visited:text-yellow-300 font-semibold"
                  : "text-white hover:text-yellow-200 visited:text-white"}>
                성과
            </NavLink>
          </li>

        </ul>
      </nav>
    </header>
  );
};

export default Header;
