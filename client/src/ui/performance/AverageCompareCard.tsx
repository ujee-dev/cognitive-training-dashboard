import StatItem from "../../components/ui/StatItem";

export function AverageCompareCard({
  recent,
  overall,
}: {
  recent: number;
  overall: number;
}) {
  // 소수점 두 자리
  const number = overall - recent;
  const diff = Math.round((number + Number.EPSILON) * 100) / 100;
  
  // 반응속도 평균 비교
  if (!overall && !recent){
    return (
      <div className='flex justify-between text-sm'>
        <p>데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      <StatItem label="최근 10 회" value={recent} unit=" 초" />
      <StatItem label="전체 평균" value={overall} unit=" 초" />
      <div className="grid place-items-center font-semibold tracking-widest">
      <span className={diff === 0 ? 'text-white' : diff > 0 ? 'text-green-600' : 'text-red-600'}>
        {diff === 0 
          ? "➖ 유지" 
          : diff > 0 
            ? `⬇ ${diff} 초 개선` 
            : `⬆ ${Math.abs(diff)} 초 저하`
        }
      </span></div>
    </div>
  );
}