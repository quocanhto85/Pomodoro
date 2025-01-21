import { TIMER_MODES, TimerMode } from "@/helpers/constants";
import { formatTime } from "@/helpers/time";
import { pomodoroService } from "@/services/api/pomodoro";
import { SkipForward } from "lucide-react";
import Button from "@/components/common/Button";

interface TimerDisplayProps {
  timeLeft: number;
  isRunning: boolean;
  mode: TimerMode;
  onToggle: () => void;
  onSkip: () => void;
  // onTest: () => void;
}

// const onTest = async () => {
//   try {
//     await pomodoroService.incrementSession();
//   } catch(error) {
//     console.error("Failed to update pomodoro session:", error);
//   }
// }

export default function TimerDisplay({ timeLeft, isRunning, mode, onToggle, onSkip }: TimerDisplayProps) {
  return (
    <div className="text-center">
      <div className="text-[120px] font-bold text-white leading-tight mb-6">
        {formatTime(timeLeft)}
      </div>
      <div className="flex justify-center items-center gap-4">
        <Button
          variant="secondary"
          className={`w-52 py-3 text-xl font-bold ${TIMER_MODES[mode].color}`}
          onClick={onToggle}
        >
          {isRunning ? "PAUSE" : "START"}
        </Button>
        {/* <Button
          variant="secondary"
          className={`w-52 py-3 text-xl font-bold ${TIMER_MODES[mode].color}`}
          onClick={onTest}
        >Test
        </Button> */}
        {isRunning && (
          <Button
            variant="secondary"
            className={`p-3 ${TIMER_MODES[mode].color}`}
            onClick={onSkip}
            aria-label="Skip"
          >
            <SkipForward className="w-6 h-6" />
          </Button>
        )}
      </div>
    </div>
  );
}