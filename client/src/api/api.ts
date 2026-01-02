import type { UserCredentials, LoginResponse } from "../types/user";
import type { Record } from "../types/record";
import api from './axios';

// 생성/변경 = POST
// 조회 = GET (로그인은 POST)
// 삭제 = DELETE
// 일부 필드 수정 = PATCH
// 전체 갱신 = PUT

// 회원가입
export async function signup(user: UserCredentials) {
  console.log(`/auth/signup`);
  const res = await api.post('/auth/signup', user);
  console.log('api.ts - signup', res.data);
  return res.data; // 에러 검사 후 데이터 반환
}

// 로그인
export async function login(user: UserCredentials): Promise<LoginResponse> {
  console.log(`/auth/login`);
  const res = await api.post('/auth/login', user);
  console.log('api.ts - login', res.data);
  return res.data; // 에러 검사 후 데이터 반환
}

// 게임 기록 저장 (JWT 인증 헤더 포함)
export async function saveRecord(record: Record) {
  console.log(`/records`);
  const res = await api.post('/records', record);
  console.log('api.ts - records save', res.data);
  return res.data; // 에러 검사 후 데이터 반환
}

// 상위 10개 랭킹 조회
export async function getTopRecords(difficulty: string) {
  console.log(`/records/top10/${difficulty}`);
  const res = await api.get(`/records/top10/${difficulty}`);
  console.log('api.ts - records rank', res.data);
  return res.data; // 에러 검사 후 데이터 반환
}

// 내 기록 조회
export async function getMyRecords(difficulty: string) {
  console.log(`/records/my/${difficulty}`);
  const res = await api.get(`/records/my/${difficulty}`);
  console.log('api.ts - my records', res.data);
  return res.data; // 에러 검사 후 데이터 반환
}
