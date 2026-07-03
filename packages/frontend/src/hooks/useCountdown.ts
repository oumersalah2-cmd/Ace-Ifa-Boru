// src/hooks/useCountdown.ts
"use client";

import { useEffect, useRef, useState } from "react";

/** Counts down to a fixed end timestamp, ticking every second. */
export function useCountdown(endTimeMs: number, onExpire?: () => void) {
  const [remainingMs, setRemainingMs] = useState(Math.max(endTimeMs - Date.now(), 0));
  const firedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(endTimeMs - Date.now(), 0);
      setRemainingMs(remaining);
      if (remaining === 0 && !firedRef.current) {
        firedRef.current = true;
        onExpire?.();
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endTimeMs, onExpire]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return { minutes, seconds, remainingMs, isExpired: remainingMs === 0 };
}
