import type { Difficulty } from '../config/gameConfig';
import type { StoredGameResult } from '../types/storage';

export function filterByDifficulty(
  results: StoredGameResult[],
  difficulty: Difficulty
): StoredGameResult[] {
  return results.filter(r => r.difficulty === difficulty);
}