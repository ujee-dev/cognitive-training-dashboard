export const Difficulty = {
  EASY: "EASY",
  NORMAL: "NORMAL",
  HARD: "HARD",
} as const;

export type Difficulty =
  typeof Difficulty[keyof typeof Difficulty];

export const GAME_CARD_CONFIG: Record<Difficulty, {
  pairs: number;
  timeLimit: number;
  previewSeconds: number;
  scoreMultiplier: number;
  accuracyWeight: number;
  reactionWeight: number;
  penaltyWeight: number;
}> = {
  EASY: {
    pairs: 4,
    timeLimit: 30,
    previewSeconds: 5,
    scoreMultiplier: 1,
    accuracyWeight: 0.8,
    reactionWeight: 0.2,
    penaltyWeight: 0,
  },
  NORMAL: {
    pairs: 6,
    timeLimit: 50,
    previewSeconds: 5,
    scoreMultiplier: 1.2,
    accuracyWeight: 0.7,
    reactionWeight: 0.3,
    penaltyWeight: 2,
  },
  HARD: {
    pairs: 8,
    timeLimit: 45,
    previewSeconds: 5,
    scoreMultiplier: 1.6,
    accuracyWeight: 0.7,
    reactionWeight: 0.3,
    penaltyWeight: 5,
  },
};
