import { DIFFICULTY_LABEL } from "../../utils/difficultyConfig";

interface Props {
  difficulty: 'easy' | 'normal' | 'hard';
  attempts: number;
  matches: number;
  fails: number;
  time: number;
  status: 'preview' | 'playing' | 'finished';
  previewLeft?: number;
}

export function GameCardHeader({ difficulty, attempts, matches, fails, time, status, previewLeft, }: Props) {
  return (
    <div className="tracking-widest text-sm text-white/80 space-y-2">
      <div>
        레벨 : <strong>{DIFFICULTY_LABEL[difficulty]}</strong>
      </div>

      {status === 'preview' && (
        <div className="font-bold tracking-widest text-yellow-400">
          " 카드 위치를 기억하세요! ({previewLeft} 초) "<br/>
        </div>
      )}

      {status === 'playing' && (
        <div>시간 : <strong>{time}</strong> 초</div>
      )}

      <div className="flex justify-between leading-relaxed tracking-widest text-white/80">
        <span>시도 :</span>
        <span><strong>{attempts}</strong> <span className="text-xs">회</span></span>
        <span>|</span>
        <span>맞춤 :</span>
        <span><strong>{matches}</strong> <span className="text-xs">회</span></span>
        <span>|</span>
        <span>실패 :</span>
        <span><strong>{fails}</strong> <span className="text-xs">회</span></span>
      </div>
    </div>
  );
}