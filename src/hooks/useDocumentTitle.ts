"use client";

import { useEffect } from "react";
import { formatTime } from "@/helpers/time";
import { TIMER_MODES, TimerMode } from "@/helpers/constants";

export default function useDocumentTitle(timeLeft: number, mode: TimerMode) {
  useEffect(() => {
    const time = formatTime(timeLeft);
    const message = TIMER_MODES[mode].message;
    document.title = `${time} - ${message}`;
  }, [timeLeft, mode]);
}