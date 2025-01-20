export interface DailyRecord {
    date: string;
    pomodoros: number;
    hours: number;
}

export interface PomodoroSession {
    userId: string;
    date: string;
    month: number;
    year: number;
    completedCount: number;
    createdAt: string;
    updatedAt: string;
  }