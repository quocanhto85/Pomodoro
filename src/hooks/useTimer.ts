"use client";

import { useState, useEffect, useCallback } from "react";
import { TimerMode, TIMER_MODES, POMODOROS_BEFORE_LONG_BREAK } from "@/helpers/constants";
import { playSound } from "@/helpers/sound";

export function useTimer() {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES[mode].time);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [currentInterval, setCurrentInterval] = useState(1);

  // Reset timer when mode changes
  useEffect(() => {
    setTimeLeft(TIMER_MODES[mode].time);
    setIsRunning(false);
  }, [mode]);

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0) {
      setIsRunning(false);
      playSound();
      handleTimerComplete();
    }
  }, [timeLeft]);

  const handleTimerComplete = useCallback(() => {
    if (mode === "pomodoro") {
      const newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);
      
      if (newCompletedPomodoros % POMODOROS_BEFORE_LONG_BREAK === 0) {
        setMode("longbreak");
      } else {
        setMode("shortbreak");
      }
    } else {
      setMode("pomodoro");
      if (mode === "shortbreak" || mode === "longbreak") {
        setCurrentInterval(prev => prev + 1);
      }
    }
  }, [mode, completedPomodoros]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleSkip = () => {
    if (mode === "pomodoro") {
      if ((completedPomodoros + 1) % POMODOROS_BEFORE_LONG_BREAK === 0) {
        setMode("longbreak");
      } else {
        setMode("shortbreak");
      }
    } else {
      setMode("pomodoro");
      if (mode === "shortbreak" || mode === "longbreak") {
        setCurrentInterval(prev => prev + 1);
      }
    }
    setTimeLeft(TIMER_MODES[mode].time);
    setIsRunning(false);
  };

  return {
    mode,
    timeLeft,
    isRunning,
    currentInterval,
    completedPomodoros,
    setMode,
    toggleTimer,
    handleSkip,
  };
}