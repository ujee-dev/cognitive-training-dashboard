import { useEffect, useRef, useState } from 'react';

export function useTimer(limitSeconds: number) {
  const [remaining, setRemaining] = useState(limitSeconds);
  const [running, setRunning] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const lastActionRef = useRef<number | null>(null);
  const reactionTimesRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);

  const start = () => {
    if (running) return;

    const now = Date.now();
    startTimeRef.current ??= now;
    lastActionRef.current ??= now;
    setRunning(true);
  };

  // Pause/Resume 토글
  const toggle = () => {
    setRunning(prev => !prev);
  };

  useEffect(() => {
    if (!running) return;

    intervalRef.current = window.setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [running]);

  // 새로 추가: 매 카드 클릭 시 마지막 액션 시간을 업데이트
  const updateLastAction = () => {
    if (!running) return;
    lastActionRef.current = Date.now();
  }

  const record = () => {
    if (!lastActionRef.current || !running) return;

    const now = Date.now();
    // 밀리초를 초로 변환하여 기록
    reactionTimesRef.current.push((now - lastActionRef.current) / 1000);
  };

  const getResult = () => {
    if (!startTimeRef.current) return null;
    
    return {
      // duration 계산을 바로 수행
      duration: limitSeconds - remaining,
      reactionTimes: reactionTimesRef.current,
    };
  };

  return {
    remaining,
    running,
    isTimeOver: remaining === 0,
    start,
    toggle,   // 핵심
    record,
    updateLastAction,
    getResult,
  };
}