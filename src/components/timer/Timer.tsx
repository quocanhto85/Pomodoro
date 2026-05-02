"use client";

import { useState, useEffect } from "react";
import {
  FOCUS_DURATIONS,
  FocusDuration,
  POMODOROS_BEFORE_LONG_BREAK,
  TIMER_MODES,
  STORAGE_KEYS,
  DEFAULT_SUBJECT,
} from "@/helpers/constants";
import { useTimer, useDocumentTitle } from "@/hooks";
import { Header, FaviconUpdater } from "@/components/common";
import { TimerDisplay, TimerStatus, TimerTabs } from "@/components/timer";
import SubjectSelector from "@/components/timer/SubjectSelector";
import { RotateCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Timer() {
  const [activeSubject, setActiveSubject] = useState(DEFAULT_SUBJECT);
  const [focusDuration, setFocusDuration] = useState<FocusDuration>(FOCUS_DURATIONS.TRADITIONAL);

  // Load active subject from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SUBJECT);
    if (saved) {
      setActiveSubject(saved);
    }

    const savedDuration = Number(localStorage.getItem(STORAGE_KEYS.FOCUS_DURATION));
    if (savedDuration === FOCUS_DURATIONS.TRADITIONAL || savedDuration === FOCUS_DURATIONS.EXTENDED) {
      setFocusDuration(savedDuration);
    }
  }, []);

  // Save active subject to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SUBJECT, activeSubject);
  }, [activeSubject]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOCUS_DURATION, focusDuration.toString());
  }, [focusDuration]);

  const {
    mode,
    timeLeft,
    isRunning,
    completedPomodoros,
    focusSessionsPerCycle,
    completedCountPerFocusSession,
    setMode,
    toggleTimer,
    handleSkip,
    resetCompletedPomodoros,
  } = useTimer(activeSubject, focusDuration);
  const completedFocusSessions = Math.floor(
    (completedPomodoros % POMODOROS_BEFORE_LONG_BREAK) / completedCountPerFocusSession
  );

  useDocumentTitle(timeLeft, mode);

  return (
    <div className={`min-h-screen ${TIMER_MODES[mode].color} transition-colors duration-300`}>
      <FaviconUpdater mode={mode} isRunning={isRunning} />
      <Header />
      <main className="container mx-auto px-4 pt-8">
        <div className="max-w-2xl mx-auto bg-white/10 rounded-lg p-6">
          <TimerTabs currentMode={mode} onModeChange={setMode} />
          <div className="mb-5 flex justify-center">
            <div className="inline-flex rounded-lg border border-white/25 bg-white/10 p-1">
              {[FOCUS_DURATIONS.TRADITIONAL, FOCUS_DURATIONS.EXTENDED].map((duration) => (
                <button
                  key={duration}
                  type="button"
                  onClick={() => setFocusDuration(duration)}
                  className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
                    focusDuration === duration
                      ? "bg-white/30 text-white"
                      : "text-white/80 hover:bg-white/20"
                  }`}
                  aria-label={`Switch to ${duration}-minute focus mode`}
                >
                  {duration} min focus
                </button>
              ))}
            </div>
          </div>
          <TimerDisplay
            timeLeft={timeLeft}
            isRunning={isRunning}
            mode={mode}
            onToggle={toggleTimer}
            onSkip={handleSkip}
          />
          <SubjectSelector
            activeSubject={activeSubject}
            onSubjectChange={setActiveSubject}
          />
          <div className="mt-4 flex items-center justify-center gap-3 text-white/85">
            <p className="text-sm md:text-base">
              Session progress:{" "}
              <span className="font-semibold">
                {completedFocusSessions}
              </span>
              /{focusSessionsPerCycle} {focusDuration}-min sessions
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
                  aria-label="Reset pomodoro session progress"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset pomodoro cycle?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will set the current pomodoro session progress back to 0 out of{" "}
                    {focusSessionsPerCycle}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetCompletedPomodoros}>Reset now</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <TimerStatus mode={mode} />
      </main>
    </div>
  );
}
