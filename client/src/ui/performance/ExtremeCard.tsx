export function ExtremeCard({best, worst}: {best:number, worst:number})
{
  return (
    <div className='flex justify-between font-semibold text-sm tracking-widest'>
      {/* 기록 하이라이트 */}
      <p>🏆 최고: {best} 점</p>
      <p>😵 최저: {worst} 점</p>
    </div>
  );
}
