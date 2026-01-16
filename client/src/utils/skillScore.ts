import { GAME_CARD_CONFIG as config, Difficulty } from "../config/gameConfig";

/**
 * 가중치 설정
 */
interface ReactionScale {
  minTime: number;
  maxTime: number;
  minScore?: number;
}

const REACTION_SCALES: Record<Difficulty, ReactionScale> = {
  [Difficulty.EASY]: { minTime: 0.4, maxTime: 2.0 },
  [Difficulty.NORMAL]: { minTime: 0.4, maxTime: 2.5 },
  [Difficulty.HARD]: { minTime: 0.5, maxTime: 3.5 },
};

// reactionScore 구하기
export function normalizeReaction(avgReactionTime: number, difficulty: Difficulty) {
  const scale = REACTION_SCALES[difficulty];

  if (avgReactionTime <= scale.minTime) return 100;
  if (avgReactionTime >= scale.maxTime) return scale.minScore ?? 0;

  const raw =
    100 -
    ((avgReactionTime - scale.minTime) / (scale.maxTime - scale.minTime)) * 100;

  return Math.max(scale.minScore ?? 0, Math.round(raw));
}

export function calcSkillScore(
  accuracy: number,
  avgReactionTime: number,
  difficulty: Difficulty,
  failedAttempts: number,
) {
  // reactionScore 구하기 호출 실행
  const reactionScore = normalizeReaction(avgReactionTime, difficulty);

  // 가중치 기반 기본 점수 (DB 설정값 사용)
  const baseScore =
    accuracy * config[difficulty].accuracyWeight +
    reactionScore * config[difficulty].reactionWeight;

  // 배율 적용
  let finalScore = baseScore * config[difficulty].scoreMultiplier;

  // 감점 적용 (Penalty Weight)
  if (failedAttempts && config[difficulty].penaltyWeight) {
    finalScore -= failedAttempts * config[difficulty].penaltyWeight;
  }

  // 점수가 음수가 되지 않도록 방지
  return Math.max(0, Math.round(finalScore));
}
