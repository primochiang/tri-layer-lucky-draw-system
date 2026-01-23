import { useState, useCallback, useRef } from 'react';

const COOLDOWN_MS = 3000;

export function useThrottle() {
  const [remainingMs, setRemainingMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSentRef = useRef(0);

  const canProceed = useCallback(() => {
    return Date.now() - lastSentRef.current >= COOLDOWN_MS;
  }, []);

  const markSent = useCallback(() => {
    lastSentRef.current = Date.now();
    setRemainingMs(COOLDOWN_MS);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const left = Math.max(0, COOLDOWN_MS - (Date.now() - lastSentRef.current));
      setRemainingMs(left);
      if (left === 0 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 200);
  }, []);

  const remainingSeconds = Math.ceil(remainingMs / 1000);

  return { canProceed, markSent, remainingSeconds, isCooling: remainingMs > 0 };
}
