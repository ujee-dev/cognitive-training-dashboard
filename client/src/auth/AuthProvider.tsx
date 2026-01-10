// src/auth/AuthProvider.tsx
// Provider는 순수해야 함 = Redux store / Zustand store와 같은 역할
import { useState, useMemo } from 'react';

import { AuthContext } from './AuthContext';
import type { UserInfo } from "./types";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      setUser,
      setIsLoading,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
