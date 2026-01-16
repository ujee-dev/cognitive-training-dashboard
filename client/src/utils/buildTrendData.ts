import type { RecordLean } from '../types/Dashboard';
import { movingAverage } from './movingAverage';

interface TrendData {
  index: number;
  raw: number;
  smooth: number;
}

// 최근 N회 추이 + 이동 평균 계산 (avgReactionTime, accuracy, skillScore)
export function buildTrendData(
  results: RecordLean[],
  key: keyof RecordLean
): TrendData[] {
  const raw = results.map(r => r[key] as number);
  const smoothed = movingAverage(raw, 5);

  return results.map((r, i) => ({
    index: i + 1,
    raw: raw[i],
    smooth: smoothed[i],
  }));
}
