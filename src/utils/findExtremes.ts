import type { StoredGameResult } from "../types/storage";

export function findExtremes(results: StoredGameResult[]) {
  if (results.length === 0) return null;

  return {
    best: results.reduce((a, b) =>
      a.avgReactionTime < b.avgReactionTime ? a : b),
    worst: results.reduce((a, b) =>
      a.avgReactionTime > b.avgReactionTime ? a : b),
  };
}