// src/auth/types.ts
export interface UserInfo {
  id: string;
  email: string;
  name: string;
  nickname: string;
  profileImage: string;
}

export interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;

  // 내부 상태 제어용 (actions에서만 사용: 일반 컴포넌트에서는 쓰지 않음)
  setUser: (user: UserInfo | null) => void;
  setIsLoading: (loading: boolean) => void;
}
