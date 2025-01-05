"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TimerMode, TIMER_MODES, POMODOROS_BEFORE_LONG_BREAK } from "@/helpers/constants";
import { Howl } from "howler";
import { pomodoroService } from "@/services/api/pomodoro";

export default function useTimer() {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES[mode].time);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [currentInterval, setCurrentInterval] = useState(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  let bellSound: any;

  const initializeBellSound = () => {
    if (!bellSound) {
      bellSound = new Howl({
        src: ["/bell_sound.wav"],
        volume: 1.0,
      });
    }
  };

  // Reset timer when mode changes
  useEffect(() => {
    setTimeLeft(TIMER_MODES[mode].time);
    setIsRunning(false);
    startTimeRef.current = null;
    endTimeRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [mode]);

  const handleTimerComplete = useCallback(async () => {
    if (mode === "pomodoro") {
      try {
        // Update Pomodoro counts in database and send data to Make webhook
        await Promise.all([
          pomodoroService.incrementSession(),
        ]);
      } catch (error) {
        console.error("Failed to update pomodoro session:", error);
      }

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

  // Main timer effect
  useEffect(() => {
    if (isRunning) {
      const now = Date.now();
      startTimeRef.current = now;
      endTimeRef.current = now + timeLeft * 1000;

      timerRef.current = setInterval(() => {
        const currentTime = Date.now();
        const remaining = Math.ceil((endTimeRef.current! - currentTime) / 1000);

        if (remaining <= 0) {
          setTimeLeft(0);
          setIsRunning(false);
          initializeBellSound();
          bellSound?.play();
          handleTimerComplete();
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        } else {
          setTimeLeft(remaining);
        }
      }, 100); // Update more frequently for smoother display
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, handleTimerComplete]);

  const toggleTimer = useCallback(() => {
    if (!isRunning) {
      // Starting timer
      setIsRunning(true);
    } else {
      // Pausing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRunning(false);
    }
  }, [isRunning]);

  const handleSkip = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mode === "pomodoro") {
      const nextPomodoros = completedPomodoros + 1;
      if (nextPomodoros % POMODOROS_BEFORE_LONG_BREAK === 0) {
        setMode("longbreak");
      } else {
        setMode("shortbreak");
      }
      setCompletedPomodoros(nextPomodoros);
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