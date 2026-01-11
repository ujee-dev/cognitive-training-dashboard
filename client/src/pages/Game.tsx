import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { Difficulty } from '../config/gameConfig';
import { GameCore } from './GameCore';
import GamePageContainer from '../components/layout/GamePageContainer';

export function Game() {
  const { state } = useLocation();
  const difficulty: Difficulty = state?.difficulty ?? 'normal';

  const [sessionId, setSessionId] = useState(0);

  return (
    <GamePageContainer>
      <GameCore
        key={sessionId} // 핵심
        difficulty={difficulty}
        onReset={() => setSessionId(id => id + 1)}
      />
    </GamePageContainer>
  );
}
