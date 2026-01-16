import type { Difficulty } from "../config/gameConfig";

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
    EASY: '쉬움',
    NORMAL: '보통',
    HARD: '어려움',
};

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
    EASY: '#4CAF50', // green
    NORMAL: '#FFC107', // amber
    HARD: '#F44336', // red
};
