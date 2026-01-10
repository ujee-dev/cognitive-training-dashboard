import type { UserCredentials, LoginResponse } from "../types/user";
import type { Record } from "../types/record";
import type { UserInfo } from "../auth/types";
import { publicApi } from "./publicAxios";
import api from './axios';

// 생성/변경 = POST / 조회 = GET (로그인은 POST)
// 삭제 = DELETE / 일부 필드 수정 = PATCH / 전체 갱신 = PUT

export interface RefreshResponse {
  accessToken: string;
}

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
  
  /**
   * "로그인"과 "회원가입"은
   * interceptor / refresh / authEventBus와
   * "절대 섞이면 안 됨!"
   * => 전용 instance("publicApi") 사용
   * 
   * - refresh interceptor 개입 방지
   * - authEventBus 발동 없음
   * - 서버 에러 그대로 `catch`에서 처리됨
   * 
   * [참고] 회원가입
   * 현재 위험성은 거의 없지만 정책 일치와 만일을 위해 전용 api 사용
   */
  signup: async (user: UserCredentials) => {
    const res = await publicApi.post(ENDPOINTS.SIGNUP, user);
    return res.data;
  },

  login: async (user: UserCredentials): Promise<LoginResponse> => {
    const res = await publicApi.post<LoginResponse>(ENDPOINTS.LOGIN, user);
    return res.data; // 에러 검사 후 데이터 반환
  },

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
