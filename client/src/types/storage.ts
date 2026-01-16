import type { Difficulty } from '../config/gameConfig';
import type { GameResultView } from './resultView';

// localStorage
export interface StoredGameResult {
  id: string; // 고유 ID - user
  difficulty: Difficulty; // EASY | NORMAL | HARD
  duration: number; // 초
  playedAt: string; // ISO string
  avgReactionTime: number; // 초
  accuracy: number; // %
  totalAttempts: number;
  correctMatches: number;
  failedAttempts: number;
  skillScore: number;
  theme?: string; // 테마값
  /* 반응속도 분산지표 고도화 작업용 - DB 생성시에는 필드 참고 미리 생성 */
  reactionTimeDetails?: number[]; // 개별 반응 시간들 (표준편차 재계산용)
  stdDev?: number; // 표준편차
  consistencyScore?: number; // 일관성 점수 (0~100)
}

export function fixNumber(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

export function storedToView(stored: StoredGameResult): GameResultView {
  return {
    ...stored,
    duration: fixNumber(stored.duration),
    accuracy: fixNumber(stored.accuracy),
    avgReactionTime: fixNumber(stored.avgReactionTime),
  };
}
