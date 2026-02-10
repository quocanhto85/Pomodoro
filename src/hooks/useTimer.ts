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

export default function useTimer(activeSubject: string) {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES[mode].time);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const bellSoundRef = useRef<Howl | null>(null);

  // Use a ref for activeSubject so it doesn't affect callback dependencies
  // but always captures the latest value when the timer completes
  const activeSubjectRef = useRef(activeSubject);
  useEffect(() => {
    activeSubjectRef.current = activeSubject;
  }, [activeSubject]);

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
    endTimeRef.current = null;
  }, []);

  const switchMode = useCallback((newMode: TimerMode) => {
    log("Switching mode", { from: mode, to: newMode });
    cleanupTimer();
    setMode(newMode);
    setTimeLeft(TIMER_MODES[newMode].time);
    setIsRunning(false);
  }, [mode, cleanupTimer]);

  const handleTimerComplete = useCallback(async () => {
    log("Timer completed", { mode, completedPomodoros, subject: activeSubjectRef.current });
    
    if (mode === "pomodoro") {
      try {
        await Promise.all([
          pomodoroService.incrementSession(activeSubjectRef.current),
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

  // Handle visibility change to sync timer when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isRunning && endTimeRef.current) {
        log("Tab became visible, syncing timer");
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
        
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
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, handleTimerComplete, initializeBellSound, cleanupTimer]);

  // Main timer effect
  useEffect(() => {
    if (isRunning) {
      // Set the end time when timer starts
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + (timeLeft * 1000);
        log("Timer started", { 
          mode, 
          timeLeft, 
          subject: activeSubjectRef.current,
          endTime: new Date(endTimeRef.current).toISOString()
        });
      }

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        
        if (!endTimeRef.current) return;

        const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
        
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
    } else {
      // Reset end time when stopped
      endTimeRef.current = null;
    }
  }, [isRunning, handleTimerComplete, initializeBellSound, cleanupTimer, mode]);

  const toggleTimer = useCallback(() => {
    if (!isRunning) {
      log("Timer starting", { mode, timeLeft, subject: activeSubjectRef.current });
      setIsRunning(true);
    } else {
      log("Timer paused", { mode, timeLeft });
      
      // When pausing, calculate the actual remaining time and reset endTime
      if (endTimeRef.current) {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
        setTimeLeft(remaining);
      }
      
      cleanupTimer();
      setIsRunning(false);
    }
  }, [isRunning, timeLeft, mode, cleanupTimer]);

  const handleSkip = useCallback(() => {
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
  }, [mode, timeLeft, cleanupTimer, completedPomodoros, switchMode]);

  return {
    mode,
    timeLeft,
    isRunning,
    completedPomodoros,
    setMode: switchMode,
    toggleTimer,
    handleSkip,
  };
}
