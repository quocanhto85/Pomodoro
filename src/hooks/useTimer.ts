"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TimerMode, TIMER_MODES, POMODOROS_BEFORE_LONG_BREAK, STORAGE_KEYS } from "@/helpers/constants";
import { Howl } from "howler";
import { pomodoroService } from "@/services/api/pomodoro";

// Debug logger
const DEBUG = true;
const log = (...args: any[]) => {
  if (DEBUG) {
    console.log(`[Timer ${new Date().toISOString()}]`, ...args);
  }
};

export default function useTimer() {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES[mode].time);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const bellSoundRef = useRef<Howl | null>(null);
  const lastTickRef = useRef<number | null>(null);

  // Initialize state from localStorage
  useEffect(() => {
    const savedPomodoros = localStorage.getItem(STORAGE_KEYS.COMPLETED_POMODOROS);
    if (savedPomodoros) {
      setCompletedPomodoros(parseInt(savedPomodoros));
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_POMODOROS, completedPomodoros.toString());
  }, [completedPomodoros]);

  const initializeBellSound = useCallback(() => {
    if (!bellSoundRef.current) {
      bellSoundRef.current = new Howl({
        src: ["/bell_sound.wav"],
        volume: 1.0,
      });
    }
  }, []);

  const cleanupTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
    endTimeRef.current = null;
    lastTickRef.current = null;
  }, []);

  const switchMode = useCallback((newMode: TimerMode) => {
    log("Switching mode", { from: mode, to: newMode });
    cleanupTimer();
    setMode(newMode);
    setTimeLeft(TIMER_MODES[newMode].time);
    setIsRunning(false);
  }, [mode, cleanupTimer]);

  const handleTimerComplete = useCallback(async () => {
    log("Timer completed", { mode, completedPomodoros });
    
    if (mode === "pomodoro") {
      try {
        await Promise.all([
          pomodoroService.incrementSession(),
        ]);
      } catch (error) {
        console.error("Failed to update pomodoro session:", error);
      }

      const newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);

      // Determine next mode
      const nextMode = newCompletedPomodoros % POMODOROS_BEFORE_LONG_BREAK === 0 
        ? "longbreak" 
        : "shortbreak";
      
      switchMode(nextMode);
    } else {
      switchMode("pomodoro");
    }
  }, [mode, completedPomodoros, switchMode]);

  // Main timer effect
  useEffect(() => {
    if (isRunning) {
      const now = Date.now();
      startTimeRef.current = now;
      endTimeRef.current = now + timeLeft * 1000;
      lastTickRef.current = now;

      intervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        
        if (!endTimeRef.current || !lastTickRef.current) return;

        // Check for large time gaps (potential browser throttling)
        const timeSinceLastTick = currentTime - lastTickRef.current;
        if (timeSinceLastTick > 2000) {
          log("Large time gap detected", { 
            gap: timeSinceLastTick,
            mode,
            currentTime
          });
        }

        lastTickRef.current = currentTime;

        // Calculate remaining time with drift compensation
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - currentTime) / 1000));
        
        if (remaining <= 0) {
          cleanupTimer();
          setTimeLeft(0);
          setIsRunning(false);
          initializeBellSound();
          bellSoundRef.current?.play();
          handleTimerComplete();
        } else {
          setTimeLeft(remaining);
        }
      }, 100);

      return () => cleanupTimer();
    }
  }, [isRunning, handleTimerComplete, initializeBellSound, cleanupTimer, mode]);

  const toggleTimer = useCallback(() => {
    if (!isRunning) {
      log("Timer started", { mode, timeLeft, currentTime: Date.now() });
      setIsRunning(true);
    } else {
      log("Timer paused", { mode, timeLeft, currentTime: Date.now() });
      cleanupTimer();
      setIsRunning(false);
    }
  }, [isRunning, timeLeft, mode, cleanupTimer]);

  const handleSkip = () => {
    log("Timer skipped", { mode, timeLeft });
    cleanupTimer();
    
    if (mode === "pomodoro") {
      const nextPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(nextPomodoros);
      
      const nextMode = nextPomodoros % POMODOROS_BEFORE_LONG_BREAK === 0 
        ? "longbreak" 
        : "shortbreak";
      
      switchMode(nextMode);
    } else {
      switchMode("pomodoro");
    }
  };

  return {
    mode,
    timeLeft,
    isRunning,
    completedPomodoros,
    setMode: switchMode, // Replace setMode with switchMode for proper cleanup
    toggleTimer,
    handleSkip,
  };
}