"use client";

import { useCallback, useRef, useState } from "react";

interface LongPressOptions {
  duration?: number; // 長按時間（毫秒），預設 3000
  onStart?: () => void;
  onFinish: () => void;
  onCancel?: () => void;
}

export function useLongPress({
  duration = 3000,
  onStart,
  onFinish,
  onCancel,
}: LongPressOptions) {
  const [progress, setProgress] = useState(0); // 0-100
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const start = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      setIsPressing(true);
      setProgress(0);
      startTimeRef.current = Date.now();
      onStart?.();

      // 每 50ms 更新進度條
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const pct = Math.min((elapsed / duration) * 100, 100);
        setProgress(pct);
      }, 50);

      timerRef.current = setTimeout(() => {
        clearInterval(intervalRef.current!);
        setProgress(100);
        setIsPressing(false);
        onFinish();
      }, duration);
    },
    [duration, onStart, onFinish]
  );

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPressing(false);
    setProgress(0);
    onCancel?.();
  }, [onCancel]);

  return {
    isPressing,
    progress,
    handlers: {
      onMouseDown: start,
      onMouseUp: cancel,
      onMouseLeave: cancel,
      onTouchStart: start,
      onTouchEnd: cancel,
    },
  };
}
