import type { Difficulty } from '../config/gameConfig';
import type { GameResultView } from './resultView';

// DB 저장용 데이터
export interface Record {
  gameId: string; // 고유 ID
  difficulty: Difficulty; // EASY | NORMAL | HARD
  duration: number; // 초
  accuracy: number; // %
  avgReactionTime: number; // 초
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

export function recordToView(rec: Record): GameResultView {
  return {
    id: rec.gameId, // 서버에서는 gameId를 id로
    difficulty: rec.difficulty,
    duration: rec.duration,
    accuracy: rec.accuracy,
    totalAttempts: rec.totalAttempts,
    correctMatches: rec.correctMatches,
    failedAttempts: rec.failedAttempts,
    avgReactionTime: rec.avgReactionTime,
    skillScore: rec.skillScore,
  };
}
