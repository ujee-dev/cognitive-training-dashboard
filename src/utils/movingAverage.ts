import { calcAverage } from "./calcAverage";

export function movingAverage(values: number[], window = 5): number[] {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1);
    return calcAverage(slice);
  })
}