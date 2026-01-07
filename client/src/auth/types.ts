// src/auth/types.ts
export interface UserInfo {
  id: string;
  email: string;
  name: string;
  nickname: string;
  profileImage: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserInfo | null;
  login: (accessToken: string) => void;
  logout: () => Promise<void>;
}
