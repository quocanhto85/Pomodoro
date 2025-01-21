import { TimerMode } from "@/helpers/constants";

interface TimerStatusProps {
  mode: TimerMode;
}

export default function TimerStatus({ mode }: TimerStatusProps) {
  return (
    <div className="max-w-2xl mx-auto mt-12 text-center">
      <p className="text-white/80 text-2xl">
        {mode === "pomodoro" ? "Time to focus!" : "Time for a break!"}
      </p>
    </div>
  );
}