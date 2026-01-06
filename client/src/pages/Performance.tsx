import { useMemo, useState } from 'react';
import type { Difficulty } from '../config/gameConfig';

// data
import { loadGameResults } from '../utils/loadGameResults';
import { getRecentResults } from '../utils/getRecentResults';
import { buildTrendData } from '../utils/buildTrendData';
import { buildAverageData } from '../utils/buildAverageData';
import { findExtremes } from '../utils/findExtremes';
import { judgeProgress } from '../utils/judgeProgress';

// chart
import { ReactionTrendChart } from '../components/charts/ReactionTrendChart';
import { AccuracyTrendChart } from '../components/charts/AccuracyTrendChart';
import { SkillScoreTrendChart } from '../components/charts/SkillScoreTrendChart';

// stats UI
import { RecentTimeline } from '../components/stats/RecentTimeline';
import { AverageCompareCard } from '../components/stats/AverageCompareCard';
import { ExtremeCard } from '../components/stats/ExtremeCard';
import { ProgressBadge } from '../components/stats/ProgressBadge';

// 공용 컴포넌트
import CardBox from '../components/common/CardBox';
import ItemDescription from '../components/common/ItemDescription';

export function Performance() {
  /* --- 난이도 --- */
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  /* --- 데이터 로드 & 파생 --- */
  // 전체 기록
  const allResults = loadGameResults();

  /** ----- useMEmo ----- **/
  // useMemo는 성능 최적화를 위해 사용되며
  // 특정 값이 변경될 때만 계산을 다시 수행하고
  // 그 외에는 이전 계산 값을 재사용하는 역할

  // 난이도 필터 - 전체 데이터
  const byDifficulty = useMemo(
    () => allResults.filter(r => r.difficulty === difficulty),
    [allResults, difficulty]
  ).filter(
    r => (r.avgReactionTime + r.accuracy) > 0
  );

  // 타임라인 가져오기 - 최근 10회 데이터
  const recentResults = useMemo(
    () => getRecentResults(byDifficulty, difficulty, 10),
    [byDifficulty, difficulty]
  ).filter(
    r => (r.avgReactionTime + r.accuracy) > 0
  );

  /* --- 반응 속도 추이 차트 --- */
  // useMemo = 랜더링을 기억하는 것이 아닌 계산 결과를 기억 (값을 반환)
  // 난이도 변경 시만 계산, 차트/카드 리렌더 최소화

  // 차트용: 이미 정제된 데이터만 받도록 설계
  // 차트별 overall 값 구하기
  // 반응속도 overall & 반응속도 평균비교
  const {
    overallReactionTime,
    recentReactionTime,
    overallSkillScore,
    overallAccuracy,
  } = useMemo(
    () => buildAverageData(byDifficulty, recentResults),
    [byDifficulty, recentResults]
  );

  // 최근 N회 반응속도 추이
  const trendData = useMemo(
    () => buildTrendData(recentResults, 'avgReactionTime'),
    [recentResults]
  ).reverse();

  // 최근 N회 집중도 추이
  const skillScoreTrendData = useMemo(
    () => buildTrendData(recentResults, 'skillScore'),
    [recentResults]
  ).reverse();

  // 최근 N회 정확도 추이
  const accuracyTrendData = useMemo(
    () => buildTrendData(recentResults, 'accuracy'),
    [recentResults]
  ).reverse();

  /* --- 최고/최저 기록 --- */
  const extremes = useMemo(
    () => findExtremes(byDifficulty),
    [byDifficulty]
  );

  /* --- 실력 향상 판정: 최근 N회, SkillScore --- */
  // 최근 데이터는 최신이 위이므로 reverse 전달
  // 하지만 useMemo 의존성 배열로 직접적(recentResults.revers()) 전달하면
  // 다른 동일한 모든 의존성 데이터(recentResults)에도 영향을 미침
  // 따라서 복사본([...recentResults])을 만들어 사용하여 원본 데이터에 영향을 주지 않도록 함
  const progress = useMemo(
    () => judgeProgress([...recentResults].reverse(), overallSkillScore),
    [recentResults, overallSkillScore]
  );

  /* --- UI --- */
  return (
    <>
      <div className='space-y-5 items-center'>
      <CardBox
        title="성과 분석 안내"
        className="bg-gray-600"
        titleClassName='text-lg tracking-normal'
        titleColor="LightSalmon"
      >
        <div className="leading-relaxed tracking-widest text-sm text-white/60">
          다음은 "유효 게임" 진행에 대한 통계 입니다. 
          ( 진행하지 않고 자동 시간 종료 또는 중단한 게임은 제외됩니다. )<br />
          <span className='text-white'>" 데이터가 적으면 분석이 정확하지 않을 수 있습니다. "</span><br />
        </div>
      </CardBox>

      {/* 난이도 선택 */}
      <CardBox title="난이도 선택: ">
        <select
          value={difficulty}
          onChange={e => setDifficulty(e.target.value as Difficulty)}
          className="border px-2 py-1 rounded text-sm mx-auto min-w-full">
            <option value="easy">쉬움</option>
            <option value="normal">보통</option>
            <option value="hard">어려움</option>
        </select>
      </CardBox>

      <CardBox title="실력 향상 배지">
        <ProgressBadge status={progress.status} message={progress.message} color={progress.color} />
      </CardBox>

      <CardBox title="최근 10 회 게임 기록">
        <RecentTimeline results={recentResults} />
      </CardBox>

      <CardBox title="최근 10 회 집중도 추이">
        <SkillScoreTrendChart data={skillScoreTrendData} overallAvg={overallSkillScore} />
      { (skillScoreTrendData.length > 0) &&
        <ItemDescription
          description1="이동 평균선 = 기준선 최근 5개의 평균 값" isRightAligned1={false}
          description2="실제 값" isRightAligned2={true}
        />
      }
      </CardBox>

      <CardBox title="최근 10 회 반응 속도 추이">
        <ReactionTrendChart data={trendData} overallAvg={overallReactionTime} />
      { (trendData.length > 0) &&
        <ItemDescription
          description1="이동 평균선 = 기준선 최근 5개의 평균 값" isRightAligned1={false}
          description2="실제 값" isRightAligned2={true}
        />
      }
      </CardBox>

      <CardBox title="최근 10 회 정확도 추이">
        <AccuracyTrendChart data={accuracyTrendData} overallAvg={overallAccuracy} />
      { (accuracyTrendData.length > 0) &&
        <ItemDescription
          description1="이동 평균선 = 기준선 최근 5개의 평균 값" isRightAligned1={false}
          description2="실제 값" isRightAligned2={true}
        />
      }
      </CardBox>

      <CardBox title="반응 속도 평균 비교">
        <AverageCompareCard recent={recentReactionTime} overall={overallReactionTime} />
      </CardBox>

      <CardBox title="기록 하이라이트">
        {!extremes
          ? <div className='flex justify-between text-sm text-white/80'>
              <p>데이터가 없습니다.</p>
            </div>
          : <ExtremeCard best={extremes.best} worst={extremes.worst}
        />}
      </CardBox>
      </div> <br />
    </>
  );
}
