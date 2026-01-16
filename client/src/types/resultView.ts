import type { Difficulty } from '../config/gameConfig';

export interface GameResultView {
  id: string;                 // 결과 페이지 식별자
  difficulty: Difficulty;

  duration: number;
  accuracy: number;
  avgReactionTime: number;

  totalAttempts: number;
  correctMatches: number;
  failedAttempts: number;

  skillScore: number;

  // 선택 필드
  playedAt?: string;
}

export interface ServerDifficultyStats {
  difficulty: 'EASY' | 'NORMAL' | 'HARD';
  games: number;
  avgAccuracy: number;
  avgReactionTime: number;
  avgDuration: number;
}

export interface DifficultyChartRow {
  difficulty: 'EASY' | 'NORMAL' | 'HARD';
  games: number;
  avgAccuracy: number;
  avgReactionTime: number;
  avgDuration: number;
}
