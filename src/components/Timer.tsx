"use client";

import { TIMER_MODES } from "@/helpers/constants";
import { useTimer } from "@/hooks/useTimer";
import { Header } from "./Header";
import { TimerDisplay } from "./TimerDisplay";
import { TimerStatus } from "./TimerStatus";
import { TimerTabs } from "./TimerTabs";

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

  return (
    <div className={`min-h-screen ${TIMER_MODES[mode].color} transition-colors duration-300`}>
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