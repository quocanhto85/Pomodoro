'use client';

import { useRef, useEffect } from 'react';

interface UseAnimationFrameTimerProps {
  isRunning: boolean;
  onTick: () => void;
}

export default function useAnimationFrameTimer({ isRunning, onTick }: UseAnimationFrameTimerProps) {
  // Initialize with undefined as the initial value
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isRunning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let previousTime = performance.now();
    let accumulatedTime = 0;

    function tick(currentTime: number) {
      if (!isRunning) return;

      const deltaTime = currentTime - previousTime;
      accumulatedTime += deltaTime;

      // Update every second
      if (accumulatedTime >= 1000) {
        onTick();
        accumulatedTime -= 1000;
      }

      previousTime = currentTime;
      animationFrameRef.current = requestAnimationFrame(tick);
    }

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, onTick]);
}