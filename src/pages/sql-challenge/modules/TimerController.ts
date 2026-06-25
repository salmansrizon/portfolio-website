import { useState, useEffect, useRef } from 'react';

// ── TimerController ────────────────────────────────────────────────────────────
// Internal module: manages countdown timer and metrics (time taken, mistakes).
// Used by SQLChallenge.tsx.

export function useTimerController(timeLimitSecs?: number | null) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const startTime = useRef<number>(Date.now());
  const [totalMistakes, setTotalMistakes] = useState(0);

  // Initialize timer
  useEffect(() => {
    if (timeLimitSecs) {
      setTimeLeft(timeLimitSecs);
      setTimerActive(true);
      startTime.current = Date.now();
    }
  }, [timeLimitSecs]);

  // Countdown interval
  useEffect(() => {
    if (!timerActive || timeLeft === null || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const recordMistake = () => {
    setTotalMistakes(prev => prev + 1);
  };

  const getTimeTaken = (): number => {
    return Math.round((Date.now() - startTime.current) / 1000);
  };

  return {
    timeLeft,
    timerActive,
    totalMistakes,
    formatTime,
    recordMistake,
    getTimeTaken,
    setTimerActive,
  };
}
