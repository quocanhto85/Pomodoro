"use client";

import { TIMER_MODES } from "@/helpers/constants";
import { useTimer, useDocumentTitle } from "@/hooks";
import { Header, FaviconUpdater } from "@/components/common";
import { TimerDisplay, TimerStatus, TimerTabs } from "@/components/timer";

export default function Timer() {
  const {
    mode,
    timeLeft,
    isRunning,
    currentInterval,
    setMode,
    toggleTimer,
    handleSkip,
  } = useTimer();

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
        </div>
        <TimerStatus mode={mode} currentInterval={currentInterval} />
      </main>
    </div>
  );
}