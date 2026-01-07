/** =========================
 1. axios.ts가 해야 할 일
  - 토큰 자동 첨부
  - Access Token 만료 → refresh 시도
  - refresh 실패 → “세션 만료 신호” 발생
  
 2. axios.ts가 하면 안 되는 일
  - 비즈니스 로직 판단
  - 복잡한 상태 관리
  - 중복된 refresh 전략
  - 여러 UX 전략 혼합
=============================*/
import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { ENDPOINTS } from "./api";

import {
  showSessionExpired,
  showForbidden,
  showServerError,
  showConflict,
} from "../ui/toast";

interface ErrorResponse {
  message?: string | string[];
}

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  withCredentials: true, // refreshToken cookie 포함
});

/* =========================
   Refresh 제어 상태
========================= */
let isRefreshing = false;

// 대기열 타입 정의 (토큰을 인자로 받는 함수 배열)
type SubscriberCallback = (token: string) => void;
let subscribers: SubscriberCallback[] = [];

// 대기열 처리 함수
function notifySubscribers(token: string) {
  subscribers.forEach((callback) => callback(token));
  subscribers = [];
}

/* =========================
   Request Interceptor
========================= */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("요청에 포함할 토큰이 없습니다!");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   Response Interceptor
========================= */
api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    const isAuthEndpoint =
      originalRequest.url?.includes(ENDPOINTS.LOGIN) ||
      originalRequest.url?.includes(ENDPOINTS.LOGOUT);

    const status = error.response?.status;

    /* ===== 401: Access Token 만료 ===== */
    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true; // 무한 루프 방지용 플래그

      // 이미 갱신 중이라면 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribers.push((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // [중요] await를 반드시 확인하세요. 
        // 인터셉터 중복 방지를 위해 기본 axios 인스턴스를 사용합니다.
        const response = await axios.post<{ accessToken: string }>(
          `${import.meta.env.VITE_APP_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.accessToken;

        // 새로운 토큰 저장
        localStorage.setItem("accessToken", newAccessToken);

        isRefreshing = false;

        // 대기 중이던 요청들에게 새 토큰 전달하며 실행
        notifySubscribers(newAccessToken);

        // 현재 실패했던 요청 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch {
        isRefreshing = false;
        subscribers = []; // 대기열 비움

        // Refresh 실패 시 세션 종료
        showSessionExpired();
        localStorage.removeItem("accessToken");
        window.location.href = ENDPOINTS.LOGIN;

        return Promise.reject(error);
      }
    }

    /* ===== 그 외 에러 UX ===== */
    if (status === 403) {
      showForbidden();
    }

    if (status === 409) {
      const msg = error.response?.data?.message;
      showConflict(Array.isArray(msg) ? msg.join(" / ") : msg);
    }

    if (status && status >= 500) {
      showServerError();
    }

    return Promise.reject(error);
  }
);

export default api;
