import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { DIFFICULTY_LABEL } from "../utils/difficultyConfig";

// chart
import { loadGameResults } from '../utils/loadGameResults';
import { buildDifficultyChartData } from '../utils/buildChartData';
import { AccuracyByDifficultyChart } from '../components/charts/AccuracyByDifficultyChart';
import { DurationByDifficultyChart } from '../components/charts/DurationByDifficultyChart';
import { ReactionByDifficultyChart } from '../components/charts/ReactionByDifficultyChart';

import CardBox from '../components/ui/CardBox';
import StatItem from "../components/performance/StatItem";

export function Result() {
  const location = useLocation();
  const id = location.state?.id as string | undefined;
  const msg = location.state?.message as string | undefined;

  const results = loadGameResults();
  const result = id ? results.find(r => r.id === id): undefined;

  // 차트는 전체 데이터를 사용함 - Hook은 조건문 앞에 위치해야 함
  const data = useMemo(
      () => buildDifficultyChartData(results),
      [results]
    );

  // 유효하지 않은 게임 메시지
  if (!id && msg) {
    return <div>{msg}</div>;
  }

  // id가 없거나, id가 있지만 결과를 찾지 못한 경우
  if (!id || !result) {
    return <div>결과를 찾을 수 없습니다.</div>;
  }

  const difficultyLabel = DIFFICULTY_LABEL[result.difficulty];

  return (
    <>
      <div className='space-y-5 w-full items-center'>
      {/* 🔹 게임 결과 카드 */}
      <CardBox title="게임 결과">
        <div className="space-y-2">
          <StatItem label="난이도" value={difficultyLabel} />
          <StatItem label="플레이 시간" value={result.duration} unit="초" />
          <StatItem label="정확도" value={result.accuracy} unit="%" />
          <StatItem label="집중력 점수" value={result.skillScore} unit="점" />
          <StatItem label="반응속도" value={result.avgReactionTime} unit="초" />
          <StatItem label="시도" value={result.totalAttempts} unit="회" />
          <StatItem label="성공" value={result.correctMatches} unit="회" />
          <StatItem label="실패" value={result.failedAttempts} unit="회" />
        </div>
      </CardBox>

      <CardBox title="난이도별 평균 소요 시간 (초)">
        <DurationByDifficultyChart data={data} />
      </CardBox>

      
      <CardBox title="난이도별 평균 정확도 (%)">
        <AccuracyByDifficultyChart data={data} />
      </CardBox>
      
      <CardBox title="난이도별 평균 반응 속도 (초)">
        <ReactionByDifficultyChart data={data} />
      </CardBox>
    </div> </>
  );
}