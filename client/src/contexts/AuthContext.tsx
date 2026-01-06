// src/contexts/AuthContext.ts
import { createContext } from 'react';

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string) => void;
  logout: () => void;
}

// 오직 Context 객체만 정의하고 내보냅니다.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
