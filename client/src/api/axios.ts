import axios,
{ AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse
} from 'axios';

// 서버 응답 데이터 타입을 위한 인터페이스 정의 (any 제거)
interface ApiErrorResponse {
  message?: string | string[];
}

const api = axios.create({
  // baseURL: process.env.REACT_APP_API_URL,
  // Vite를 사용하는 경우: Vite는 process.env를 사용하지 않습니다.
  // 대신 **import.meta.env**를 사용하며,
  // 타입 정의를 위해 vite-env.d.ts 파일이 필요
  baseURL: import.meta.env.VITE_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Refresh Token(쿠키) 전송을 위해 필수
});

// 요청 인터셉터: 모든 요청에 Access Token 주입
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    console.log('현재 로컬스토리지 토큰:', token); // 1. 토큰 존재 여부 확인

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ 요청에 포함할 토큰이 없습니다!'); // 2. 토큰 없을 때 경고
    }

    console.log('최종 요청 헤더:', config.headers); // 3. 헤더 전체 확인
    return config;
  },
  (error)  => Promise.reject(error)
);

// 응답 인터셉터: 에러 핸들링 및 토큰 만료 처리
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    // _retry 속성을 포함하도록 타입 확장
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/logout");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true; // 무한 루프 방지용 플래그

      // [Case 1] 401 에러(인증 만료) 발생 시 토큰 갱신 시도
      try {
        // NestJS의 Refresh 엔드포인트 호출
        // 주의: 이 요청은 'api' 인스턴스가 아닌 'axios' 기본 인스턴스를 사용해야 인터셉터 중복을 피합니다.
        const response = await axios.post<{ accessToken: string }>(
          `${import.meta.env.VITE_APP_API_URL}/auth/refresh`, // 백엔드
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;

        // 새로운 토큰 저장 후 기존 요청 헤더 교체
        localStorage.setItem("accessToken", accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // 원래 실패했던 요청 재시도
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh Token도 만료된 경우: 로그아웃 처리 및 페이지 이동
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // [Case 2] 일반적인 에러 메시지 처리 (NestJS에서 보낸 메시지 추출)
    const serverMessage = error.response?.data?.message;
    
    // 에러 객체를 수정해서 다시 던짐
    if (serverMessage) {
      error.message = Array.isArray(serverMessage) 
        ? serverMessage.join(' / ') 
        : serverMessage;
    }
    
    return Promise.reject(error);
  }
);

export default api;
