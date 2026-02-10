export interface SubjectRecord {
    subject: string;
    pomodoros: number;
    hours: number;
}

export interface DailyRecord {
    date: string;
    pomodoros: number;
    hours: number;
    subjects: SubjectRecord[];
}

export interface PomodoroSession {
    userId: string;
    date: string;
    month: number;
    year: number;
    completedCount: number;
    subject?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MonthlySubjectData {
    [subject: string]: number[]; // 12-element array of pomodoro counts per month
}

export interface StatsData {
    totalPomodoros: number;
    monthlyPomodoros: number[];
    subjects: string[];
    monthlyBySubject: MonthlySubjectData;
}

// Color palette for subject visualization
export const SUBJECT_COLORS = [
    '#4285F4', // Blue
    '#EA4335', // Red
    '#FBBC05', // Amber
    '#34A853', // Green
    '#FF6D01', // Orange
    '#46BDC6', // Teal
    '#7B1FA2', // Purple
    '#E91E63', // Pink
    '#795548', // Brown
    '#607D8B', // Blue Grey
    '#00BCD4', // Cyan
    '#8BC34A', // Light Green
    '#FF5722', // Deep Orange
    '#3F51B5', // Indigo
    '#9C27B0', // Deep Purple
];

export function getSubjectColor(index: number): string {
    return SUBJECT_COLORS[index % SUBJECT_COLORS.length];
}
