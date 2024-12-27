import { TimerMode } from "@/helpers/constants";

interface TimerStatusProps {
  mode: TimerMode;
  currentInterval: number;
}

export default function TimerStatus({ mode, currentInterval }: TimerStatusProps) {
  return (
    <div className="max-w-2xl mx-auto mt-12 text-center">
      <h2 className="text-white/90 text-xl font-bold">#{currentInterval}</h2>
      <p className="text-white/80 text-2xl">
        {mode === "pomodoro" ? "Time to focus!" : "Time for a break!"}
      </p>
    </div>
  );
}