import { useRef, useState, useEffect, useCallback } from 'react';

import type { CardItem, GameResult, GameStatus, GameConfig } from '../types/game';
import { cardImages } from '../types/cardData';
import { createShuffledDeck } from '../utils/createShuffledDeck';
import { useTimer } from './useGameTimer';
import { Difficulty } from '../config/gameConfig';
import { GAME_CARD_CONFIG } from '../config/gameConfig';

export function useCardLogic(configOrDiff: GameConfig | Difficulty) {
  // 설정값 도출 헬퍼: 헬퍼 함수 및 초기 설정값 (최상단)
  const getSettings = (val: GameConfig | Difficulty) => {
    if (typeof val === 'string') {
      // difficulty(문자열)가 들어온 경우: 해당 난이도의 기본값 + 난이도 명칭 추가
      return { ...GAME_CARD_CONFIG[val], difficulty: val };
    }
    // config 객체가 들어온 경우: 그대로 사용
    return val;
  };

  const initial = getSettings(configOrDiff);

  // 카드 생성 로직을 위로 올림 (useCallback 권장)
  const createCards = useCallback((pairs: number, preview = false): CardItem[] => {
    // pairs 수만큼 이미지 선택
    const selectedImages = cardImages.slice(0, pairs);
    // 짝 만들기 (앞면 카드 2장씩)
    const duplicatedImages = [...selectedImages, ...selectedImages];
    // 섞기
    const shuffled = createShuffledDeck(duplicatedImages);
    // CardItem으로 변환
    return shuffled.map((image, idx) => ({
      id: idx,
      image,
      isFlipped: preview,
      isMatched: false,
    }));
  }, []); // 의존성이 없다면 빈 배열

  // 상태 선언
  const [difficulty, setDifficulty] = useState<Difficulty>(initial.difficulty);
  const [pairs, setPairs] = useState(initial.pairs);
  const [timeLimit, setTimeLimit] = useState(initial.timeLimit);
  const [previewSeconds, setPreviewSeconds] = useState(initial.previewSeconds);
  const [cards, setCards] = useState(() => createCards(initial.pairs, true));
  const [status, setStatus] = useState<GameStatus>('preview');
  const [previewLeft, setPreviewLeft] = useState(previewSeconds);
  
  const flippedRef = useRef<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [locked, setLocked] = useState(false);
  const [ctlPlayBtn, setPlayBtn] = useState(false);


  // 3. 외부(GameCore)에서 configOrDiff가 변경될 때 상태 동기화
  useEffect(() => {
    const current = getSettings(configOrDiff);
    
    setDifficulty(current.difficulty);
    setPairs(current.pairs);
    setTimeLimit(current.timeLimit);
    setPreviewSeconds(current.previewSeconds);
    
    // 난이도가 바뀌면 카드도 새로 생성
    setCards(createCards(current.pairs, true));
    setPreviewLeft(current.previewSeconds); // 프리뷰 카운트다운 초기화
  }, [configOrDiff]);

  useEffect(() => {
    if (status !== 'preview') return;

    const interval = setInterval(() => {
      setPreviewLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const t = setTimeout(() => {
      setCards(prev =>
        prev.map(c => ({ ...c, isFlipped: false }))
      );
      setStatus('playing');
    }, previewSeconds * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(t);
    };
  }, [status]);
  // ES-Lite 경고: previewLeft는 functional update로 처리되므로 deps에 포함하지 않음

  const timer = useTimer(timeLimit);

  const failedAttempts = attempts - correctMatches;
  const finished = correctMatches === pairs || timer.isTimeOver;

  const handleCardClick = (id: number) => {
    if (status !== 'playing') return;
    if (locked || finished) return;

    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    timer.start();
    if(!ctlPlayBtn) setPlayBtn(true);
    
    // [1] 두 번째 카드 클릭 시에만 반응 시간 기록
    if (flippedRef.current.length > 0) {
      timer.record();
    }

    // [2] 모든 카드 클릭 시 마지막 액션 시간을 업데이트 (반드시 record() 호출 후에 와야 함)
    timer.updateLastAction();

    setCards(prev =>
      prev.map(c => (c.id === id ? { ...c, isFlipped: true } : c))
    );

    flippedRef.current.push(id);
    if (flippedRef.current.length === 2) {
      handleMatch(flippedRef.current[0], flippedRef.current[1]);
    }
  };

  const handleMatch = (a: number, b: number) => {
    setLocked(true);
    setAttempts(p => p + 1);

    const first = cards.find(c => c.id === a);
    const second = cards.find(c => c.id === b);

    if (first && second && first.image === second.image) {
      setCorrectMatches(p => p + 1);
      setCards(prev =>
        prev.map(c =>
          c.image === first.image ? { ...c, isMatched: true } : c
        )
      );
      flippedRef.current = [];
      setLocked(false);
    } else {
      setTimeout(() => {
        setCards(prev =>
          prev.map(c =>
            c.id === a || c.id === b ? { ...c, isFlipped: false } : c
          )
        );
        flippedRef.current = [];
        setLocked(false);
      }, 600);
    }
  };
  
  const getResult = (): GameResult => { 
    const timerResult = timer.getResult();
    
    // timer.getResult()가 null인 경우 (카드를 클릭하지 않은 채 종료된 경우)를 처리
    const duration = timerResult?.duration ?? (timer.isTimeOver ? timeLimit : 0);
    const reactionTimes = timerResult?.reactionTimes ?? [];
    
    const acc = (attempts === 0) 
                ? 0 
                : Math.round((correctMatches / attempts) * (correctMatches / pairs) * 100); // attempts가 0일 때 나누기 0 방지

    return {
      difficulty, // useState로 관리되는 현재 난이도 문자열
      totalAttempts: attempts,
      correctMatches,
      failedAttempts,
      accuracy: acc,
      duration,
      reactionTimes,
    };
  };

  return {
    cards,
    attempts,
    correctMatches,
    failedAttempts,
    remainingTime: timer.remaining,
    isRunning: timer.running,   // 상태 노출
    togglePause: timer.toggle,  // 토글 함수
    finished,
    handleCardClick,
    getResult,
    status,
    previewLeft,
    ctlPlayBtn, // 플레이버튼 (시작,정지) 컨트롤
  };
}
