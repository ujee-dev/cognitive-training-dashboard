import type { StoredGameResult } from '../../types/storage';

export function RecentTimeline({ results }: { results: StoredGameResult[] }) {

  if (results.length == 0) {
    return (
        <div className='flex justify-between text-sm'>
            <p>데이터가 없습니다.</p>
        </div>
    );
  }

  return (
    <div className='text-sm'>
      {/* 헤더 부분 - 가독성을 위해 폰트 굵기와 색상 조정 */}
      <li className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] w-full font-bold border-b border-gray-500 pb-2">
        <span className="pl-2 text-left">날짜</span>
        <span className="text-right">진행</span>
        <span className="text-right">정확도</span>
        <span className="text-right">반응</span>
        <span className="text-right">집중도</span>
      </li>

      {/* 데이터 리스트 */}
      {results.map((r) => (
        <li 
          key={r.id} 
          className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] w-full py-3 border-b border-gray-300 last:border-0 hover:bg-surface-50 transition-colors"
        >
          <span className="text-left font-medium text-surface-700">
            {new Date(r.playedAt).toLocaleDateString()}
          </span>
          <span className="text-right">{r.duration}s</span>
          <span className="text-right">{r.accuracy}%</span>
          <span className="text-right">{r.avgReactionTime}s</span>
          <span className="text-right font-semibold">{r.skillScore}점</span>
        </li>
      ))}
    </div>
  );
}