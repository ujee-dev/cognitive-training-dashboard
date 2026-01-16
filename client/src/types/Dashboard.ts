// 날짜 진행 정확도 반응속도 집죽도
export interface RecordLean {
  id: string;
  createdAt: Date;
  duration: number;
  accuracy: number;
  avgReactionTime: number;
  skillScore: number;
}

// Ranking DTO 정리 (실제 반환 구조 기준)
export interface RankingItemDto {
  rank: number;
  userId: string;
  score: number;
  nickname: string;
  profileImage: string | null;
  isMe: boolean;
}

// Progress 타입
export interface ProgressDto {
  status: string;
  color: string;
  trend: 'up' | 'down' | 'flat' | 'none';
  message: string;
  changeRate?: number;
  duration?: 'short' | 'long';
}

// DashboardResponseDto
export interface DashboardResponseDto {
  recentRecords: RecordLean[];

  avgReactionRecent10: number;

  avgReaction30dValue: number;
  overallAvgSkillScore: number;
  avgAccuracy30dValue: number;

  bestSkillScore: number;
  worstSkillScore: number;

  ranking: RankingItemDto[];
  myRank: number | null;
  totalPlayers: number;
  topPercentage: number | null;

  progress: ProgressDto;
}
