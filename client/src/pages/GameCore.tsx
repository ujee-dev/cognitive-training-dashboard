import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardLogic } from '../hooks/useCardLogic';
import GameCardBoard from '../components/game/GameCardBoard';
import { GameCardHeader } from '../components/game/GameCardHeader';
import type { Difficulty } from '../config/gameConfig';
import { PreviewProgress } from '../components/game/PreviewProgress';
import { GAME_CARD_CONFIG } from '../config/gameConfig';
import type { StoredGameResult } from '../types/storage';
import { calcAverage } from '../utils/calcAverage';
import { calcSkillScore } from '../utils/skillScore';
import { saveResult } from '../utils/storage';

import Card from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface Props {
  difficulty: Difficulty;
  onReset: () => void;
}

export function GameCore({ difficulty, onReset }: Props) {
  const navigate = useNavigate();
  const game = useCardLogic(difficulty);

  const { finished, getResult, togglePause, } = game;

  useEffect(() => {
    if (!finished) return;

    const result = getResult();
    togglePause();

    const avgReactionTime = calcAverage(result.reactionTimes); // 배열 평균

    // 유효 여부 판단
    if (avgReactionTime + result.accuracy > 0) {
      const skillScore = calcSkillScore(result.accuracy, avgReactionTime);

      const stored: StoredGameResult = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}`,
        difficulty: result.difficulty,
        playedAt: new Date().toISOString(),
        duration: result.duration,
        accuracy: result.accuracy,
        totalAttempts: result.totalAttempts,
        correctMatches: result.correctMatches,
        failedAttempts: result.failedAttempts,
        avgReactionTime: avgReactionTime,
        skillScore: skillScore,
      };

      saveResult(stored);

      // navigate()의 두 번쨰 인자는 NavigateOptions 타입이고
      // id 같은 커스텀 같은 options가 아니라 state 안에 넣어야 함
      navigate('/result', { state: { id: stored.id }, replace: true });
    } else {
      // 유효하지 않은 게임 메시지 전달
      navigate('/result', { 
        state: { 
          id: null, 
          message1: '유효하지 않은 게임입니다.',
          message2: '확인할 수 있는 게임 결과가 없습니다.'
        }, 
        replace: true 
      });
    }
  }, [finished, navigate]);

  return (
    <>
      <Card variant="leafGreen">
        <GameCardHeader
          difficulty={difficulty}
          attempts={game.attempts}
          matches={game.correctMatches}
          fails={game.failedAttempts}
          time={game.remainingTime}
          status={game.status}
          previewLeft={game.previewLeft}
        />
      </Card>

      {game.status === 'preview' && (
          <PreviewProgress
          left={game.previewLeft}
          total={GAME_CARD_CONFIG[difficulty].previewSeconds}
          />
      )}

      <GameCardBoard
        cards={game.cards}
        onCardClick={game.handleCardClick}
      />

      <div
        className="flex flex-col-2 gap-4 items-center justify-center">
        
        {game.ctlPlayBtn && (
          <Button
            variant="primary"
            size="sm"
            className='ml-5 w-40'
            onClick={game.togglePause}
          >
            {game.isRunning ? '정지 ||' : '시작 ▶'}
          </Button>
        )}

        <Button
          variant="danger"
          size="sm"
          className='ml-5 w-40'
          onClick={onReset}
        >
          초기화
        </Button>
      </div>
      <br/>
    </>
  );
}