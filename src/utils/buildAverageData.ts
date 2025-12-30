import type { StoredGameResult } from '../types/storage';
import { calcAverage } from './calcAverage';

// 평균 계산 함수 (동적 항목 처리) - T는 number로 제약
function buildAverage<T extends number>(all: StoredGameResult[], key: keyof StoredGameResult) {
  return calcAverage(all.map(r => r[key] as unknown as T));
}

// 반응속도, 집중도, 정확도를 한 번에 처리하는 함수
export function buildAverageData(all: StoredGameResult[], recent?: StoredGameResult[]) {
  const result: Record<string, number> = {};

  // 전체 평균
  result['overallReactionTime'] = buildAverage<number>(all, 'avgReactionTime');
  result['overallSkillScore'] = buildAverage<number>(all, 'skillScore');
  result['overallAccuracy'] = buildAverage<number>(all, 'accuracy');

  // 최근 평균 (recent 데이터가 제공되면 계산)
  if (recent) {
    result['recentReactionTime'] = buildAverage<number>(recent, 'avgReactionTime');
    result['recentSkillScore'] = buildAverage<number>(recent, 'skillScore');
    result['recentAccuracy'] = buildAverage<number>(recent, 'accuracy');
  }

  return result;
}
