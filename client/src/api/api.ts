import type { Record } from "../types/record";
import type {
  UserInfo,
  SignupRequest,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  //UpdateProfileRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
} from "../auth/types";

import { publicApi } from "./publicAxios";
import api from "./axios";
import type { Difficulty } from "../config/gameConfig";
import type { DashboardResponseDto } from "../types/Dashboard";

// 생성/변경 = POST / 조회 = GET (로그인은 POST)
// 삭제 = DELETE / 일부 필드 수정 = PATCH / 전체 갱신 = PUT

/**
 * API 엔드포인트 상수화 =  관리가 용이하고 오타를 방지
 */
export const ENDPOINTS = {
  SIGNUP: "/auth/signup",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  RECORDS: "/records",
  REFRESH: "/auth/refresh",
  ME: "/auth/me",
  PROFILE: "/users/profile",
  CHANGEPW: "/users/password",
  ACOUNT: "/users/account",
  //PROFILEIMG: "/auth/profile-image",
} as const;

/**
 * 인증 관련 API
 */
export const authApi = {
  /**
   * "로그인(login)"과 "회원가입(signup)"은
   * interceptor / refresh / authEventBus와
   * "절대 섞이면 안 됨!"
   * => 전용 instance("publicApi") 사용
   *
   * - refresh interceptor 개입 방지
   * - authEventBus 발동 없음
   * - 서버 에러 그대로 `catch`에서 처리됨
   */
  signup: async (user: SignupRequest) => {
    const res = await publicApi.post(ENDPOINTS.SIGNUP, user);
    return res.data;
  },

  login: async (user: LoginRequest): Promise<LoginResponse> => {
    const res = await publicApi.post<LoginResponse>(ENDPOINTS.LOGIN, user);
    return res.data; // 에러 검사 후 데이터 반환
  },

  //----- publicApi end ----- //

  logoutApi: () => api.post(ENDPOINTS.LOGOUT),

  refresh: async (): Promise<RefreshResponse> => {
    const res = await api.post<RefreshResponse>(ENDPOINTS.REFRESH);
    return res.data;
  },

  // 내 정보 가져오기
  getMe: async (): Promise<UserInfo> => {
    const res = await api.get<UserInfo>(ENDPOINTS.ME);
    return res.data;
  },

  // 회원 정보 관리
  updateProfile: async (user: FormData): Promise<UserInfo> => {
    const res = await api.patch<UserInfo>(ENDPOINTS.PROFILE, user, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  changePassword: async (user: ChangePasswordRequest): Promise<void> => {
    await api.post(ENDPOINTS.CHANGEPW, user);
  },

  deleteAccount: async (user: DeleteAccountRequest) => {
    const res = await api.delete(ENDPOINTS.ACOUNT, {data: user});
    return res.data;
  },

  /** 이미지만 별도 저장일 때, 현재는 한 번에 회원정보 수정으로 사용하지 않음
  uploadProfileImage: async (user: FormData): Promise<UserInfo> => {
    const res = await api.post<UserInfo>(ENDPOINTS.PROFILEIMG, user, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteProfileImage: async (): Promise<UserInfo> => {
    const res = await api.delete<UserInfo>(ENDPOINTS.PROFILEIMG);
    return res.data;
  },
  */
};

/**
 * 게임 데이터 관련 API
 */
export const recordApi = {
  getGame: async(code: string) => {
    const res = await api.get(`${ENDPOINTS.RECORDS}/games/${code}`);
    return res.data;
  },

  getGameConfig: async(code: string, difficulty: Difficulty) => {
    const res = await api.get(`${ENDPOINTS.RECORDS}/gameConfig`, {
      params: {
        gameId: code,
        difficulty: difficulty,
      },
    });
    return res.data;
  },

  saveRecord: async (record: Record) => {
    const res = await api.post(ENDPOINTS.RECORDS, record);
    return res.data;
  },

  // 현재 클라이언트 코드 사용 유지..
  getMyStats: async (code: string) => {
    const res = await api.get(`${ENDPOINTS.RECORDS}/stats/summary`, {
      params: {
        gameId: code,
      },
    });

    return res.data;
  },

  getDashboard: async (code: string, difficulty: string):
    Promise<DashboardResponseDto> => {
      const res = await api.get(`${ENDPOINTS.RECORDS}/dashboard`, {
        params: {
          gameId: code,
          difficulty: difficulty,
        },
      });

      return res.data;
  },
};
