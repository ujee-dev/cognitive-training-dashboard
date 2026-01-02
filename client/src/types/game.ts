// 게임 플레이 중 사용
export type Difficulty = 'easy' | 'normal' | 'hard';

export type GameStatus = 'preview' | 'playing' | 'finished';

export interface CardItem {
  id: number;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface GameResult {
  difficulty: Difficulty;
  totalAttempts: number;
  correctMatches: number;
  failedAttempts: number;
  accuracy: number;
  duration: number; // 초
  reactionTimes: number[];
}