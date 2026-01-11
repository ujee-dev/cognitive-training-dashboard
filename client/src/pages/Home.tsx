import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import type { Difficulty } from '../config/gameConfig';

import PageContainer from "../components/layout/PageContainer";
import Card from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export function Home() {

  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  return (
    <PageContainer>
      <Card title="Cognitive Training Dashboard" variant="default">
        <p className="text-sm leading-relaxed">
          카드 매칭 게임을 통해 
          <strong className="text-orange-400">{" "}반응속도</strong>와
          <strong className="text-orange-400">{" "}정확도</strong>를 측정하고, 이를 결합한
          <strong className="text-orange-400">{" "}집중도 지표</strong>를 설계한
          {" "}"React 기반"{" "}프로젝트입니다. 게임 결과를
          <strong className="text-orange-400">{" "}난이도별·시간 흐름별로 분석</strong>하여
          <strong className="text-orange-400">{" "}시각화</strong>로 보여드립니다.
        </p>
      </Card>

      {/* 컨트롤 박스 */}
      <div className="flex items-center gap-2 text-sm">
        <span className='ml-7 font-semibold'>난이도 선택 - </span>

        <select
          value={difficulty}
          className="bg-surface-600 border-surface-900 rounded
           text-white px-3 py-1
           focus:outline-none focus:ring-2 focus:ring-surface-600"
          onChange={e => setDifficulty(e.target.value as Difficulty)}
        >
          <option value="easy">쉬움</option>
          <option value="normal">보통</option>
          <option value="hard">어려움</option>
        </select>
        {/* 게임 시작 버튼 */}
        <Button
          variant="primary"
          size="sm"
          className='ml-5 max-w-60 w-auto'
          onClick={() => navigate('/game', { state: { difficulty } })}
        >
          게임 시작
        </Button>
      </div>
    </PageContainer>

  );
}
