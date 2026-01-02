import type { StoredGameResult } from '../types/storage';

const STORAGE_KEY = 'cogni_results';

// 조회: 절대 계산하지 않고 있는 그대로 불러오기만 함
export function loadResults(): StoredGameResult[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as StoredGameResult[];
  } catch {
    return [];
  }
}

// 모든 난이도를 한 배열에 저장하고 분리는 조회 시점에서 수행
export function saveResult(result: StoredGameResult) {
  const prev = loadResults();

  const next = [...prev, result];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearResults() {
  localStorage.removeItem(STORAGE_KEY);
}