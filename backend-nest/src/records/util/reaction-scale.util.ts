import { Difficulty } from '../enum/difficulty.enum';

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

export function calculateReactionScore(
  avgReactionTime: number,
  difficulty: Difficulty,
): number {
  const scale = REACTION_SCALES[difficulty];

  if (avgReactionTime <= scale.minTime) return 100;
  if (avgReactionTime >= scale.maxTime) return scale.minScore ?? 0;

  const raw =
    100 -
    ((avgReactionTime - scale.minTime) / (scale.maxTime - scale.minTime)) * 100;

  return Math.max(scale.minScore ?? 0, Math.round(raw));
}
