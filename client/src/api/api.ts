import type { UserCredentials, LoginResponse } from "../types/user";
import type { Record } from "../types/record";
import type { UserInfo } from "../auth/types";
import api from './axios';

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
} as const;

/**
 * 인증 관련 API
 */
export const authApi = {
  signup: async (user: UserCredentials) => {
    const res = await api.post(ENDPOINTS.SIGNUP, user);
    return res.data;
  },

  login: async (user: UserCredentials): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>(ENDPOINTS.LOGIN, user);
    return res.data;
  },

  // 이 부분의 이름이 loginApi로 되어 있는지 확인!
  loginApi: async (user: UserCredentials): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/login', user);
    return res.data;
  },

  logoutApi: () => api.post("/auth/logout"),

  // 내 정보 가져오기 (Header 컴포넌트 등에서 사용)
  getMe: async (): Promise<UserInfo> => {
    console.log('api.ts: ', ENDPOINTS.ME);
    const res = await api.get<UserInfo>(ENDPOINTS.ME);
    return res.data;
  },
};

/**
 * 게임 데이터 관련 API
 */
export const recordApi = {
  saveRecord: async (record: Record) => {
    const res = await api.post(ENDPOINTS.RECORDS, record);
    return res.data;
  },

  getTop10: async (difficulty: string) => {
    const res = await api.get(`${ENDPOINTS.RECORDS}/top10/${difficulty}`);
    return res.data;
  },

  getMyRecords: async (difficulty: string) => {
    const res = await api.get(`${ENDPOINTS.RECORDS}/my/${difficulty}`);
    return res.data;
  },
};
