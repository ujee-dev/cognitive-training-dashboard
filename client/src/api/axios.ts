import axios from 'axios';

const api = axios.create({
  // baseURL: process.env.REACT_APP_API_URL,
  // Vite를 사용하는 경우: Vite는 process.env를 사용하지 않습니다.
  // 대신 **import.meta.env**를 사용하며,
  // 타입 정의를 위해 vite-env.d.ts 파일이 필요
  baseURL: import.meta.env.VITE_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
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
  (error) => {
    // 서버가 보낸 에러 응답이 있다면 그 안의 message를 우선 사용
    const customMessage = error.response?.data?.message || error.message;
    
    // 에러 객체를 수정해서 다시 던짐
    error.message = Array.isArray(customMessage) 
      ? customMessage.join(' / ') 
      : customMessage;
    
    return Promise.reject(error);
  }
);

export default api;
