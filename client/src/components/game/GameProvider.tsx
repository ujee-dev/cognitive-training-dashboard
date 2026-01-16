import { useState, useMemo } from 'react';
import { GameContext } from './GameContext';
import type { GameInfo } from './GameContextType';

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameInfo, setGame] = useState<GameInfo | null>(null);

  const value = useMemo(
    () => ({
      gameInfo,
      setGame
    }),
    [gameInfo]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
