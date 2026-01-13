"use client";

import { useEffect, useRef } from "react";
import { formatTime } from "@/helpers/time";
import { TIMER_MODES, TimerMode } from "@/helpers/constants";

export default function useDocumentTitle(timeLeft: number, mode: TimerMode) {
  const lastUpdateRef = useRef<string>("");
  
  useEffect(() => {
    const time = formatTime(timeLeft);
    const message = TIMER_MODES[mode].message;
    const newTitle = `${time} - ${message}`;
    
    // Only update if title actually changed to avoid unnecessary DOM updates
    if (newTitle !== lastUpdateRef.current) {
      document.title = newTitle;
      lastUpdateRef.current = newTitle;
    }
  }, [timeLeft, mode]);

  // Reset title when component unmounts
  useEffect(() => {
    return () => {
      document.title = "Pomodoro - Boost your productivity";
    };
  }, []);
}