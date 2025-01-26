export const TIMER_MODES = {
  pomodoro: {
    label: "Pomodoro", time: 25 * 60, color: "bg-pomodoro",
    iconColor: "rgb(186, 73, 73)",
    message: "Time to focus!"
  },
  shortbreak: {
    label: "Short Break", time: 5 * 60, color: "bg-shortbreak",
    iconColor: "rgb(56, 133, 138)",
    message: "Time for a break!"
  },
  longbreak: {
    label: "Long Break", time: 15 * 60, color: "bg-longbreak",
    iconColor: "rgb(57, 112, 151)",
    message: "Time for a break!"
  },
} as const;

export const STORAGE_KEYS = {
  COMPLETED_POMODOROS: "completedPomodoros",
} as const;

export const POMODOROS_BEFORE_LONG_BREAK = 4;

export type TimerMode = keyof typeof TIMER_MODES;

export const PAUSED_ICON_COLOR = "#808080";