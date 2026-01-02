import type { StoredGameResult } from '../../types/storage';

type Props = {
  best: StoredGameResult;
  worst: StoredGameResult;
};

export function ExtremeCard({ best, worst }: Props) {
  return (
    <div className='flex justify-between text-sm text-white/80'>
      {/* 기록 하이라이트 */}
      <p>🏆 최고: {best.avgReactionTime} 초</p>
      <p>😵 최저: {worst.avgReactionTime} 초</p>
    </div>
  );
}