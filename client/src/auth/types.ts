// src/auth/types.ts
export interface UserInfo {
  id: string;
  email: string;
  name: string;
  nickname: string;
  profileImage?: string;
}

export interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;

  // 내부 상태 제어용 (actions에서만 사용: 일반 컴포넌트에서는 쓰지 않음)
  setUser: (user: UserInfo | null) => void;
  setIsLoading: (loading: boolean) => void;
}

// 로그인. 회원가입
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  nickname: string;
}

// 회원 정보 관리
export interface UpdateProfileRequest {
  nickname?: string;
  profileImage?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountRequest {
  password: string;
}
