"use client";

import { useState, useEffect } from "react";
import { TIMER_MODES, STORAGE_KEYS, DEFAULT_SUBJECT } from "@/helpers/constants";
import { useTimer, useDocumentTitle } from "@/hooks";
import { Header, FaviconUpdater } from "@/components/common";
import { TimerDisplay, TimerStatus, TimerTabs } from "@/components/timer";
import SubjectSelector from "@/components/timer/SubjectSelector";

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
    setMode,
    toggleTimer,
    handleSkip,
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
        </div>
        <TimerStatus mode={mode} />
      </main>
    </div>
  );
}
