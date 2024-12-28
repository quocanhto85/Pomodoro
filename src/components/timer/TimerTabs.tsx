import { TIMER_MODES, TimerMode } from "@/helpers/constants";
import Button from "@/components/common/Button";

interface TimerTabsProps {
  currentMode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
}

export default function TimerTabs({ currentMode, onModeChange }: TimerTabsProps) {
  return (
    <div className="flex justify-center gap-4 mb-8">
      {(Object.keys(TIMER_MODES) as TimerMode[]).map((mode) => (
        <Button
        key={mode}
        className={`transition-colors font-bold ${
          currentMode === mode 
            ? "bg-white/40" 
            : "hover:bg-white/30"
        }`}
        onClick={() => onModeChange(mode)}
      >
        {TIMER_MODES[mode].label}
      </Button>
      ))}
    </div>
  );
}