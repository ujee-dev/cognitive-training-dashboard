import type { StoredGameResult } from "../types/storage";
import type { Difficulty } from "../config/gameConfig";

// 게임 기록 타임라인 (최근 10판: limit)
export function getRecentResults(
    results: StoredGameResult[],
    difficulty: Difficulty,
    limit = 10
): StoredGameResult[] {
    // 메서드 체이닝(한 객체의 메서드를 연속으로 호출하는 패턴)
    // = 반드시 대상 객체가 있어야 함 > return 없으면 JS 문법 오류
    return results
      .filter(r => r.difficulty === difficulty)
      .slice(-limit)
      .reverse(); // 최신이 위
}