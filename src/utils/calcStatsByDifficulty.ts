import type { StoredGameResult } from '../types/storage';
import type { Difficulty } from '../config/gameConfig';

export interface DifficultyStats {
  difficulty: Difficulty;
  games: number;
  avgDuration: number;
  avgAccuracy: number;
  avgReactionTime: number;
  avgFails: number;
}

export function calcStatsByDifficulty(
  results: StoredGameResult[]
): DifficultyStats[] {
  const grouped: Record<Difficulty, StoredGameResult[]> = {
    easy: [],
    normal: [],
    hard: [],
  };

  // Group results by difficulty
  results.forEach(r => {
    grouped[r.difficulty].push(r);
  });

  // Helper function to calculate averages
  const calculateAverages = (items: StoredGameResult[]) => {
    const sum = items.reduce(
      (acc, cur) => {
        acc.duration += cur.duration;
        acc.accuracy += cur.accuracy;
        acc.reaction += cur.avgReactionTime;
        acc.fails += cur.failedAttempts;
        return acc;
      },
      { duration: 0, accuracy: 0, reaction: 0, fails: 0 }
    );

    const len = items.length;

    return {
      avgDuration: Math.round(sum.duration / len),
      avgAccuracy: Math.round(sum.accuracy / len),
      avgReactionTime: Math.round((sum.reaction / len) * 10) / 10,
      avgFails: Math.round(sum.fails / len),
    };
  };

  // Map through grouped difficulties and calculate stats
  return (Object.keys(grouped) as Difficulty[]).map(diff => {
    const items = grouped[diff];
    
    if (items.length === 0) {
      return {
        difficulty: diff,
        games: 0,
        avgDuration: 0,
        avgAccuracy: 0,
        avgReactionTime: 0,
        avgFails: 0,
      };
    }

    const averages = calculateAverages(items);

    return {
      difficulty: diff,
      games: items.length,
      ...averages,
    };
  });
}