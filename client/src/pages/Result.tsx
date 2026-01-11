import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { DIFFICULTY_LABEL } from "../utils/difficultyConfig";

// chart
import { loadGameResults } from '../utils/loadGameResults';
import { buildDifficultyChartData } from '../utils/buildChartData';
import { AccuracyByDifficultyChart } from '../ui/charts/AccuracyByDifficultyChart';
import { DurationByDifficultyChart } from '../ui/charts/DurationByDifficultyChart';
import { ReactionByDifficultyChart } from '../ui/charts/ReactionByDifficultyChart';

import StatItem from "../components/ui/StatItem";
import Card from '../components/ui/Card';
import PageContainer from '../components/layout/PageContainer';

export function Result() {
  const location = useLocation();
  const id = location.state?.id as string | undefined;
  const msg1 = location.state?.message1 as string | undefined;
  const msg2 = location.state?.message2 as string | undefined;

  const results = loadGameResults();
  const result = id ? results.find(r => r.id === id): undefined;

  // 차트는 전체 데이터를 사용함 - Hook은 조건문 앞에 위치해야 함
  const data = useMemo(
      () => buildDifficultyChartData(results),
      [results]
    );

  // 유효하지 않은 게임 메시지
  if (!id && (msg1 || msg2)) {
    return <Card variant='brand'>{msg1}<br/>{msg2}</Card>;
  }

  // id가 없거나, id가 있지만 결과를 찾지 못한 경우
  if (!id || !result) {
    return <Card variant='brand'>결과를 찾을 수 없습니다.</Card>;
  }

  const difficultyLabel = DIFFICULTY_LABEL[result.difficulty];

  return (
    <PageContainer>
      {/* 🔹 게임 결과 카드 */}
      <Card title="게임 결과" variant="brandDark">
        <hr className="border-t border-surface-100 my-6" />
        <div className="space-y-2">
          <StatItem label="난이도" value={difficultyLabel} />
          <StatItem label="플레이 시간" value={result.duration} unit="초" />
          <StatItem label="정확도" value={result.accuracy} unit="%" />
          <StatItem label="집중력 점수" value={result.skillScore} unit="점" textColor='text-yellow-400' />
          <StatItem label="반응속도" value={result.avgReactionTime} unit="초" />
          <StatItem label="시도" value={result.totalAttempts} unit="회" />
          <StatItem label="성공" value={result.correctMatches} unit="회" />
          <StatItem label="실패" value={result.failedAttempts} unit="회" />
        </div>
        <hr className="border-b border-surface-100 my-6" />
      </Card>

      <Card
        title="* 난이도별 평균 소요 시간 (초)"
        variant="default" titleVariant="semiBase">
        <DurationByDifficultyChart data={data} />
      </Card>

      
      <Card
        title="* 난이도별 평균 정확도 (%)"
        variant="default" titleVariant="semiBase">
        <AccuracyByDifficultyChart data={data} />
      </Card>
      
      <Card
        title="* 난이도별 평균 반응 속도 (초)"
        variant="default" titleVariant="semiBase">
        <ReactionByDifficultyChart data={data} />
      </Card>
      <div className='h-12'/>
    </PageContainer>
  );
}
