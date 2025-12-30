export type Difficulty = 'easy' | 'normal' | 'hard';

export const GAME_CARD_CONFIG: Record<Difficulty, {
  pairs: number;
  time: number;
  previewSeconds: number;
}> = {
  easy: {
    pairs: 4,
    time: 30,
    previewSeconds: 5,
  },
  normal: {
    pairs: 6,
    time: 50,
    previewSeconds: 5,
  },
  hard: {
    pairs: 8,
    time: 45,
    previewSeconds: 5,
  },
};