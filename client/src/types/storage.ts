import type { Difficulty } from '../config/gameConfig';

// localStorage, DB 저장용 데이터
export interface StoredGameResult {
  id: string;               // 고유 ID
  difficulty: Difficulty;   // easy | normal | hard
  playedAt: string;         // ISO string
  duration: number;         // 초
  accuracy: number;         // %
  totalAttempts: number;
  correctMatches: number;
  failedAttempts: number;
  avgReactionTime: number;  // 초
  skillScore: number;
  //theme: String;                 // 테마값
  /* 반응속도 분산지표 고도화 작업용 - DB 생성시에는 필드 참고 미리 생성*/
  //reactionTimeDetails: number[]; // 개별 반응 시간들 (표준편차 재계산용)
  //stdDev: number;                // 표준편차
  //consistencyScore: number;      // 일관성 점수 (0~100)
}