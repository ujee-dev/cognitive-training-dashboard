import type { GameResultView } from '../types/resultView';
import { calcStatsByDifficulty } from './calcStatsByDifficulty';

// UI는 이 함수만 사용: 데이터 소스 변경되어도 UI 영향 없음

export function buildDifficultyChartData(results: GameResultView[]) {
  return calcStatsByDifficulty(results);
}
