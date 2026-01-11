import { DIFFICULTY_LABEL } from "../../utils/difficultyConfig";
import type { GameStatus } from "../../types/game";
import type { Difficulty } from "../../types/game";
interface Props {
  difficulty: Difficulty;
  attempts: number;
  matches: number;
  fails: number;
  time: number;
  status: GameStatus;
  previewLeft?: number;
}

export function GameCardHeader({ difficulty, attempts, matches, fails, time, status, previewLeft, }: Props) {
  return (
    <div className="text-sm space-y-3">
      <div>
        레벨 :<strong>{" "}{DIFFICULTY_LABEL[difficulty]}</strong>
      </div>

      {status === 'preview' && (
        <div className="font-bold tracking-widest text-yellow-300">
          " 카드 위치를 기억하세요! ({previewLeft} 초) "<br/>
        </div>
      )}

      {status !== 'preview' && (
        <div>시간 :<strong className="font-bold tracking-widest text-yellow-300">{" "}{time}</strong> 초</div>
      )}

      <div className="flex justify-between leading-relaxed tracking-widest">
        <span>시도 :</span>
        <span><strong>{" "}{attempts}</strong> <span>{" "}회</span></span>
        <span>|</span>
        <span>맞춤 :</span>
        <span><strong>{" "}{matches}</strong> <span>{" "}회</span></span>
        <span>|</span>
        <span>실패 :</span>
        <span><strong>{" "}{fails}</strong> <span>{" "}회</span></span>
      </div>
    </div>
  );
}