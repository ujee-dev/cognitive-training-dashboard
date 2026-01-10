import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useLocation } from "react-router-dom";
import { useAuthActions } from "../../auth/useAuthActions";

// "Auth 초기화 완료된 상태에서만 렌더링됨"

const Header: React.FC = () => {
  const { user } = useAuth();
  const { logout } = useAuthActions();
  
  const [isOpen, setIsOpen] = useState(false); // 모바일 메뉴 상태

  const location = useLocation();
  
  // 헤더를 숨길 경로 정의
  const hideHeaderPaths = ["/login", "/signup"];
  if (hideHeaderPaths.includes(location.pathname)) return null;

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `${
    isActive ? "text-brand font-bold" : "text-surface-600"
  } hover:text-brand-light transition-colors`;

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 fixed top-0 left-0 w-full z-50 shadow-sm">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <NavLink to="/" className="text-2xl font-extrabold text-indigo-600 tracking-tight">
          CogniDash
        </NavLink>

        {/* 햄버거 버튼 (색상 대비 강화) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>

        {/* 메뉴 영역 */}
        <div className={`${
            isOpen ? "absolute top-16 left-0 w-full bg-white border-b border-slate-200 p-4 flex flex-col shadow-lg" : "hidden"
          } md:static md:flex md:w-auto md:flex-row md:items-center md:border-none md:bg-transparent md:p-0 md:shadow-none gap-6`}
        >
          <ul className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <li><NavLink to="/game" className={getNavLinkClass} onClick={() => setIsOpen(false)}>게임</NavLink></li>
            {user && (
              <li><NavLink to="/performance" className={getNavLinkClass} onClick={() => setIsOpen(false)}>성과</NavLink></li>
            )}
            
            <div className="hidden md:block w-px h-4 bg-slate-300 mx-2" />
              <li>
                {!user ? (
                  <NavLink 
                    to="/login" 
                    className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all inline-block"
                    onClick={() => setIsOpen(false)}
                  >
                    로그인
                  </NavLink>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1 rounded-full">
                      {user?.profileImage ? (
                        <img src={user.profileImage} alt="profile" />
                      ) : (
                        user?.nickname[0] // 이름의 첫 글자만 표시 (예: '홍')
                      )}
                    </div>
                    <button
                      onClick={() => { logout(); setIsOpen(false); }}
                      className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all inline-block"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
