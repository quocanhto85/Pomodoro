import { TimerMode } from "@/helpers/constants";

interface TimerStatusProps {
  mode: TimerMode;
}

export default function TimerStatus({ mode }: TimerStatusProps) {
  return (
    <div className="max-w-2xl mx-auto mt-8 sm:mt-12 text-center px-4">
      <p className="text-white/80 text-xl sm:text-2xl">
        {mode === "pomodoro" ? "Time to focus!" : "Time for a break!"}
      </p>
    </div>
  );
}