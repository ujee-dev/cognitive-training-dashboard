import type { StoredGameResult } from '../../types/storage';

export function RecentTimeline({ results }: { results: StoredGameResult[] }) {

  if (results.length == 0) {
    return (
        <div className='flex justify-between text-sm text-white/80'>
            <p>데이터가 없습니다.</p>
        </div>
    );
  }

  return (
    <div className='text-white text-sm'>
      {/* 최근 10회 플레이 기록 */}
      <ul className="space-y-1">
        <li className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] py-1">
          <span className='pl-5'>날짜</span>
          <span className="text-right">진행 시간</span>
          <span className="text-right">정확도</span>
          <span className="text-right">반응 속도</span>
          <span className="text-right">집중도</span>
        </li>
        
        {results.map(r => (
          <li key={r.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] py-1">
            <span>{new Date(r.playedAt).toLocaleDateString()}</span>
            <span className="text-right">{r.duration} 초</span>
            <span className="text-right">{r.accuracy} %</span>
            <span className="text-right">{r.avgReactionTime} 초</span>
            <span className="text-right">{r.skillScore} 점</span>
          </li>
        ))}
      </ul>
    </div>
  );
}