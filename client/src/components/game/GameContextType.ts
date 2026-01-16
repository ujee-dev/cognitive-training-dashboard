export interface GameInfo {
  id: string;
  code: string;
  name: string;
}

export interface GameContextType {
  gameInfo: GameInfo | null;
  setGame: (game: GameInfo | null) => void;
}
