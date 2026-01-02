import type { StoredGameResult } from '../types/storage';
import { calcStatsByDifficulty } from './calcStatsByDifficulty';

// UI는 이 함수만 사용: 데이터 소스 변경되어도 UI 영향 없음

export function buildDifficultyChartData(results: StoredGameResult[]) {
  return calcStatsByDifficulty(results);
}