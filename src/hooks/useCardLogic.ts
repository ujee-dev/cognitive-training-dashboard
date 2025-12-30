import { useRef, useState, useEffect } from 'react';
import type { CardItem, GameResult, GameStatus } from '../types/game';
import { cardImages } from '../types/cardData';
import { createShuffledDeck } from '../utils/createShuffledDeck';
import { useTimer } from './useGameTimer';
import type { Difficulty } from '../config/gameConfig';
import { GAME_CARD_CONFIG } from '../config/gameConfig';

export function useCardLogic(difficulty: Difficulty) {
  const { pairs, time, previewSeconds } = GAME_CARD_CONFIG[difficulty];
  const [status, setStatus] = useState<GameStatus>('preview');
  const [previewLeft, setPreviewLeft] = useState(previewSeconds);

  const createCards = (
    pairs: number,
    preview = false
  ): CardItem[] => {
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
  };

  const [cards, setCards] = useState(() => createCards(pairs, true));
  const flippedRef = useRef<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [locked, setLocked] = useState(false);

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

  const timer = useTimer(time);

  const failedAttempts = attempts - correctMatches;
  const finished = correctMatches === pairs || timer.isTimeOver;

  const handleCardClick = (id: number) => {
    if (status !== 'playing') return;
    if (locked || finished) return;

    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    timer.start();
    // [1] 두 번째 카드 클릭 시에만 반응 시간 기록
    if (flippedRef.current.length > 0) timer.record();

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
    const duration = timerResult?.duration ?? (timer.isTimeOver ? time : 0);
    const reactionTimes = timerResult?.reactionTimes ?? [];
    
    const acc = (attempts === 0) 
                ? 0 
                : Math.round((correctMatches / attempts) * (correctMatches / pairs) * 100); // attempts가 0일 때 나누기 0 방지

    return {
      difficulty,
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
  };
}