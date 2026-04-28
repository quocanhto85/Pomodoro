"use client";

import { useState, useEffect } from "react";
import {
  TIMER_MODES,
  STORAGE_KEYS,
  DEFAULT_SUBJECT,
  POMODOROS_BEFORE_LONG_BREAK,
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

  // Load active subject from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SUBJECT);
    if (saved) {
      setActiveSubject(saved);
    }
  }, []);

  // Save active subject to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SUBJECT, activeSubject);
  }, [activeSubject]);

  const {
    mode,
    timeLeft,
    isRunning,
    completedPomodoros,
    setMode,
    toggleTimer,
    handleSkip,
    resetCompletedPomodoros,
  } = useTimer(activeSubject);

  useDocumentTitle(timeLeft, mode);

  return (
    <div className={`min-h-screen ${TIMER_MODES[mode].color} transition-colors duration-300`}>
      <FaviconUpdater mode={mode} isRunning={isRunning} />
      <Header />
      <main className="container mx-auto px-4 pt-8">
        <div className="max-w-2xl mx-auto bg-white/10 rounded-lg p-6">
          <TimerTabs currentMode={mode} onModeChange={setMode} />
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
                {completedPomodoros % POMODOROS_BEFORE_LONG_BREAK}
              </span>
              /{POMODOROS_BEFORE_LONG_BREAK} pomodoros
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
                    {POMODOROS_BEFORE_LONG_BREAK}.
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
