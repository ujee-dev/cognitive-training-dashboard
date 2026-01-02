import type { Difficulty } from "../config/gameConfig";

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
    easy: '쉬움',
    normal: '보통',
    hard: '어려움',
};

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
    easy: '#4CAF50', // green
    normal: '#FFC107', // amber
    hard: '#F44336', // red
};