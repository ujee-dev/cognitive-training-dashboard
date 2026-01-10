import axios from "axios";
import { startRefresh, clearRefresh } from "./refreshController";
import { authApi } from "./api";
import { authEventBus } from "../auth/authEventBus";
import { sessionState } from "../auth/sessionState";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // 로그아웃 중이면 interceptor 개입 금지
    if (sessionState.isLoggingOut) {
      return Promise.reject(error);
    }

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
