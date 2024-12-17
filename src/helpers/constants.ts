export const TIMER_MODES = {
  pomodoro: { label: "Pomodoro", time: 25 * 60, color: "bg-pomodoro" },
  shortbreak: { label: "Short Break", time: 5 * 60, color: "bg-shortbreak" },
  longbreak: { label: "Long Break", time: 15 * 60, color: "bg-longbreak" },
} as const;

export const POMODOROS_BEFORE_LONG_BREAK = 4;

export type TimerMode = keyof typeof TIMER_MODES;