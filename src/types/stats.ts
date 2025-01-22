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

export interface StatsResponse {
    totalPomodoros: number;
    monthlyPomodoros: number[];
}

export interface ServiceResult {
    success: boolean;
    data?: StatsResponse;
    error?: string;
}