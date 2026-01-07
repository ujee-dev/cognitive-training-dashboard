import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import type { Difficulty } from '../config/gameConfig';

import CardBox from '../components/ui/CardBox';

export function Home() {

  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  return (
    <div className='w-full space-y-10 justify-center items-center'>
      <CardBox
        title="Cognitive Training Dashboard : 인지 훈련"
        className="bg-gray-700"
        titleClassName='text-lg tracking-normal'
        titleColor="LightSalmon"
      >
        <div className="text-justify tracking-widest text-sm text-white/60">
          <span className='font-semibold text-white'>카드 매칭 게임</span>
          을 통해 " <span className='font-semibold text-white'>반응속도</span>
           ", " <span className='font-semibold text-white'>정확도</span> "를 측정하고,
          이를 결합한 <span className='font-semibold text-white'>** 집중도 지표 **</span> 를 설계한 React 기반 프로젝트입니다.
          게임 결과를 <span className='font-semibold text-white'>난이도별·시간 흐름별로 분석</span>하여
          <span className='font-semibold text-white'> 시각화</span>로 보여드립니다.
        </div>
      </CardBox>
      <div>
        <span className='font-bold ml-5'>▶ 난이도 선택 :</span>
        <select
          value={difficulty}
          className='font-bold ml-5'
          onChange={e => setDifficulty(e.target.value as Difficulty)}
        >
          <option value="easy">쉬움</option>
          <option value="normal">보통</option>
          <option value="hard">어려움</option>
        </select>
        <button
          className='bg-blue-100 font-bold ml-5'
          onClick={() => navigate('/game', { state: { difficulty } })}
        >
          게임 시작
        </button>
      </div>
    </div>
  );
}
