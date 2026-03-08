import axios from "axios";
import { startRefresh, clearRefresh } from "./refreshController";
import { authApi } from "./api";
import { authEventBus } from "../auth/authEventBus";
import { sessionState } from "../auth/sessionState";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const instance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/**
 * Request interceptor
 * accessToken 자동 주입
 */
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor
 * 401 → refresh → 재시도
 */
instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // 로그아웃 중이면 interceptor 개입 금지
    if (sessionState.isLoggingOut) {
      return Promise.reject(error);
    }

    // 401 아니면 그대로 에러
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const newToken = await startRefresh(async () => {
        const res = await authApi.refresh();
        localStorage.setItem("accessToken", res.accessToken);
        return res.accessToken;
      });

      original.headers.Authorization = `Bearer ${newToken}`;
      return instance(original);
    } catch (err) {
      clearRefresh();

      // refresh 실패는 여기서만 처리: "단 한 번만" 실패 이벤트 발생
      if (sessionState.markRefreshFailed()) {
        authEventBus.emit("refresh-failed");
      }

      return Promise.reject(err);
    }
  }
);

export default instance;
